import { useState } from "react";
import { Helmet } from "react-helmet";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, ShoppingCart } from "lucide-react";
import GroceryList from "@/components/grocery/grocery-list";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const newListSchema = z.object({
  name: z.string().min(2, { message: "List name must be at least 2 characters." }),
});

export default function GroceryListsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  const { data: groceryLists = [] } = useQuery({
    queryKey: ["/api/grocery-lists"],
  });
  
  const form = useForm<z.infer<typeof newListSchema>>({
    resolver: zodResolver(newListSchema),
    defaultValues: {
      name: "",
    },
  });
  
  const createListMutation = useMutation({
    mutationFn: async (values: z.infer<typeof newListSchema>) => {
      return await apiRequest("POST", "/api/grocery-lists", {
        ...values,
        userId: user?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-lists"] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: "List created",
        description: "Your grocery list has been created successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to create list",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof newListSchema>) => {
    createListMutation.mutate(values);
  };
  
  return (
    <>
      <Helmet>
        <title>Grocery Lists | NutriPlan</title>
        <meta name="description" content="Create and manage your grocery shopping lists. Automatically generate lists from your meal plan." />
      </Helmet>
      
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Grocery Lists</h1>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create New List
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Grocery List</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>List Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Weekly Shopping" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <div className="flex justify-end space-x-2">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={createListMutation.isPending}>
                      {createListMutation.isPending ? "Creating..." : "Create List"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
        
        {/* Current grocery list */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">Current List</h2>
          <GroceryList />
        </div>
        
        {/* All grocery lists */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">My Lists</h2>
          
          {groceryLists.length === 0 ? (
            <Card>
              <CardContent className="pt-6 flex flex-col items-center justify-center py-12">
                <ShoppingCart className="h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">No Grocery Lists</h3>
                <p className="text-gray-500 mb-4 text-center max-w-md dark:text-gray-400">
                  You haven't created any grocery lists yet. Create a new list to get started.
                </p>
                <Button onClick={() => setIsDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New List
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groceryLists.map((list: any) => (
                <Card key={list.id}>
                  <CardHeader className="pb-2">
                    <CardTitle className="flex justify-between items-center">
                      {list.name}
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(list.createdAt).toLocaleDateString()}
                      </span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm" className="flex-1">
                        Edit
                      </Button>
                      <Button size="sm" className="flex-1" asChild>
                        <a href={`/grocery-lists/${list.id}`}>View</a>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
        
        {/* Generate from meal plan */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4 dark:text-white">Generate from Meal Plan</h2>
          
          <Card>
            <CardContent className="pt-6">
              <p className="text-gray-500 mb-4 dark:text-gray-400">
                Generate a grocery list based on your current meal plan.
              </p>
              <Button>Generate Grocery List</Button>
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  );
}
