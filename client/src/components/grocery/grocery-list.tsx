import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Download, Plus } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { getGroceryCategories } from "@/lib/utils";

const groceryItemSchema = z.object({
  name: z.string().min(2, { message: "Item name must be at least 2 characters." }),
  category: z.string().min(1, { message: "Please select a category." }),
  quantity: z.string().optional(),
});

interface GroceryListProps {
  listId?: number;
}

export default function GroceryList({ listId }: GroceryListProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const categories = getGroceryCategories();
  
  const { data: groceryItems = [] } = useQuery({
    queryKey: ["/api/grocery-lists", listId || "current", "items"],
  });
  
  const { data: currentList } = useQuery({
    queryKey: ["/api/grocery-lists", "current"],
  });
  
  const form = useForm<z.infer<typeof groceryItemSchema>>({
    resolver: zodResolver(groceryItemSchema),
    defaultValues: {
      name: "",
      category: "produce",
      quantity: "",
    },
  });
  
  const addItemMutation = useMutation({
    mutationFn: async (values: z.infer<typeof groceryItemSchema>) => {
      if (!currentList && !listId) {
        // Create a new list first
        const response = await apiRequest("POST", "/api/grocery-lists", {
          userId: user?.id,
          name: "My Grocery List",
        });
        const newList = await response.json();
        return await apiRequest("POST", "/api/grocery-items", {
          ...values,
          listId: newList.id,
        });
      }
      
      return await apiRequest("POST", "/api/grocery-items", {
        ...values,
        listId: listId || currentList?.id,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-lists"] });
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-items"] });
      form.reset();
      setIsDialogOpen(false);
      toast({
        title: "Item added",
        description: "Your item has been added to the grocery list",
      });
    },
    onError: (error) => {
      toast({
        title: "Failed to add item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, isChecked }: { id: number, isChecked: boolean }) => {
      return await apiRequest("PATCH", `/api/grocery-items/${id}`, {
        isChecked,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/grocery-items"] });
    },
    onError: (error) => {
      toast({
        title: "Failed to update item",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (values: z.infer<typeof groceryItemSchema>) => {
    addItemMutation.mutate(values);
  };
  
  const handleToggleItem = (id: number, currentChecked: boolean) => {
    toggleItemMutation.mutate({ id, isChecked: !currentChecked });
  };
  
  // Group items by category
  const groupedItems = groceryItems.reduce((acc: Record<string, any[]>, item: any) => {
    const category = item.category.toLowerCase();
    if (!acc[category]) acc[category] = [];
    acc[category].push(item);
    return acc;
  }, {});
  
  const exportList = () => {
    let list = "My Grocery List\n\n";
    
    // Add each category and its items
    Object.entries(groupedItems).forEach(([category, items]) => {
      const capitalizedCategory = category.charAt(0).toUpperCase() + category.slice(1);
      list += `${capitalizedCategory}:\n`;
      
      items.forEach((item: any) => {
        const checkmark = item.isChecked ? "[x] " : "[ ] ";
        const quantity = item.quantity ? ` (${item.quantity})` : "";
        list += `${checkmark}${item.name}${quantity}\n`;
      });
      
      list += "\n";
    });
    
    // Create and download the file
    const blob = new Blob([list], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "grocery-list.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  
  return (
    <div className="mb-8">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Grocery List</h2>
        <div className="flex space-x-2">
          <Button variant="outline" onClick={exportList}>
            <Download className="h-4 w-4 mr-1" />
            Export
          </Button>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Grocery Item</DialogTitle>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Item Name</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Apples" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Quantity (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., 5 or 2 lbs" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Category</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {categories.map((category) => (
                              <SelectItem key={category} value={category}>
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
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
                    <Button type="submit" disabled={addItemMutation.isPending}>
                      {addItemMutation.isPending ? "Adding..." : "Add Item"}
                    </Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden dark:bg-dark-card dark:border-gray-700">
        <img
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1500&h=300"
          alt="Grocery shopping for fresh produce"
          className="w-full h-32 object-cover"
        />
        
        <div className="p-6">
          {Object.entries(groupedItems).length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">Your grocery list is empty. Add some items to get started!</p>
            </div>
          ) : (
            Object.entries(groupedItems).map(([category, items]) => (
              <div key={category} className="mb-4">
                <h3 className="font-medium text-gray-800 mb-2 dark:text-white">
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <ul className="space-y-2">
                  {items.map((item: any) => (
                    <li key={item.id} className="flex items-center">
                      <Checkbox
                        id={`item-${item.id}`}
                        checked={item.isChecked}
                        onCheckedChange={() => handleToggleItem(item.id, item.isChecked)}
                        className="h-4 w-4 text-primary rounded border-gray-300 focus:ring-primary mr-2 dark:bg-gray-700 dark:border-gray-600"
                      />
                      <label
                        htmlFor={`item-${item.id}`}
                        className={`text-gray-700 dark:text-gray-300 ${
                          item.isChecked ? "line-through text-gray-400 dark:text-gray-500" : ""
                        }`}
                      >
                        {item.name} {item.quantity && `(${item.quantity})`}
                      </label>
                    </li>
                  ))}
                </ul>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
