import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { toast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash, Loader, Save } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

export default function PresetMealPlans() {
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editingPreset, setEditingPreset] = useState<any>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: "",
    category: "weight_loss",
    description: "",
    mealCount: 3,
    calorieTarget: 2000,
    proteinTarget: 100,
    carbsTarget: 200,
    fatTarget: 70,
    data: JSON.stringify({
      meals: [
        { name: "Breakfast", recipes: [], calories: 0 },
        { name: "Lunch", recipes: [], calories: 0 },
        { name: "Dinner", recipes: [], calories: 0 },
      ]
    }, null, 2)
  });
  
  // Query preset meal plans
  const { data: presets, isLoading } = useQuery({
    queryKey: ["/api/meal-plans/presets"],
  });
  
  // Delete preset meal plan
  const deletePresetMutation = useMutation({
    mutationFn: async (id: number) => {
      return await apiRequest("DELETE", `/api/admin/meal-plans/presets/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans/presets"] });
      toast({
        title: "Preset deleted",
        description: "The preset meal plan has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting preset",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Create preset meal plan
  const createPresetMutation = useMutation({
    mutationFn: async (data: any) => {
      try {
        const processedData = {
          ...data,
          data: typeof data.data === 'string' ? JSON.parse(data.data) : data.data,
          mealCount: Number(data.mealCount),
          calorieTarget: Number(data.calorieTarget),
          proteinTarget: Number(data.proteinTarget),
          carbsTarget: Number(data.carbsTarget),
          fatTarget: Number(data.fatTarget),
        };
        return await apiRequest("POST", `/api/admin/meal-plans/presets`, processedData);
      } catch (error) {
        console.error("Error processing data:", error);
        throw new Error("Invalid JSON data format");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans/presets"] });
      setOpen(false);
      resetForm();
      toast({
        title: "Preset created",
        description: "The preset meal plan has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating preset",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Update preset meal plan
  const updatePresetMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number, data: any }) => {
      try {
        const processedData = {
          ...data,
          data: typeof data.data === 'string' ? JSON.parse(data.data) : data.data,
          mealCount: Number(data.mealCount),
          calorieTarget: Number(data.calorieTarget),
          proteinTarget: Number(data.proteinTarget),
          carbsTarget: Number(data.carbsTarget),
          fatTarget: Number(data.fatTarget),
        };
        return await apiRequest("PATCH", `/api/admin/meal-plans/presets/${id}`, processedData);
      } catch (error) {
        console.error("Error processing data:", error);
        throw new Error("Invalid JSON data format");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/meal-plans/presets"] });
      setOpen(false);
      resetForm();
      toast({
        title: "Preset updated",
        description: "The preset meal plan has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating preset",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form input change
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle select change
  const handleSelectChange = (name: string, value: string) => {
    setFormData({
      ...formData,
      [name]: value,
    });
  };
  
  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingPreset) {
      updatePresetMutation.mutate({ id: editingPreset.id, data: formData });
    } else {
      createPresetMutation.mutate(formData);
    }
  };
  
  // Reset form
  const resetForm = () => {
    setFormData({
      name: "",
      category: "weight_loss",
      description: "",
      mealCount: 3,
      calorieTarget: 2000,
      proteinTarget: 100,
      carbsTarget: 200,
      fatTarget: 70,
      data: JSON.stringify({
        meals: [
          { name: "Breakfast", recipes: [], calories: 0 },
          { name: "Lunch", recipes: [], calories: 0 },
          { name: "Dinner", recipes: [], calories: 0 },
        ]
      }, null, 2)
    });
    setEditingPreset(null);
  };
  
  // Edit preset
  const handleEdit = (preset: any) => {
    setEditingPreset(preset);
    setFormData({
      name: preset.name,
      category: preset.category,
      description: preset.description,
      mealCount: preset.mealCount,
      calorieTarget: preset.calorieTarget,
      proteinTarget: preset.proteinTarget,
      carbsTarget: preset.carbsTarget,
      fatTarget: preset.fatTarget,
      data: typeof preset.data === 'object' ? JSON.stringify(preset.data, null, 2) : preset.data,
    });
    setOpen(true);
  };
  
  // Delete preset
  const handleDelete = (id: number) => {
    if (window.confirm("Are you sure you want to delete this preset meal plan?")) {
      deletePresetMutation.mutate(id);
    }
  };
  
  // Check if any mutations are pending
  const isProcessing = createPresetMutation.isPending || updatePresetMutation.isPending || deletePresetMutation.isPending;
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Preset Meal Plans</h2>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="mr-2 h-4 w-4" />
              Add New Preset
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>{editingPreset ? "Edit Preset Meal Plan" : "Create New Preset Meal Plan"}</DialogTitle>
              <DialogDescription>
                {editingPreset 
                  ? "Update the details of this preset meal plan template."
                  : "Create a new preset meal plan template that users can apply to their meal plans."}
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Name</Label>
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Select
                      value={formData.category}
                      onValueChange={(value) => handleSelectChange("category", value)}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select a category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weight_loss">Weight Loss</SelectItem>
                        <SelectItem value="weight_gain">Weight Gain</SelectItem>
                        <SelectItem value="muscle_building">Muscle Building</SelectItem>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="keto">Keto</SelectItem>
                        <SelectItem value="paleo">Paleo</SelectItem>
                        <SelectItem value="low_carb">Low Carb</SelectItem>
                        <SelectItem value="high_protein">High Protein</SelectItem>
                        <SelectItem value="balanced">Balanced</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={2}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="mealCount">Meal Count</Label>
                    <Input
                      id="mealCount"
                      name="mealCount"
                      type="number"
                      min="1"
                      max="6"
                      value={formData.mealCount}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="calorieTarget">Calorie Target</Label>
                    <Input
                      id="calorieTarget"
                      name="calorieTarget"
                      type="number"
                      min="500"
                      max="5000"
                      value={formData.calorieTarget}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="proteinTarget">Protein (g)</Label>
                    <Input
                      id="proteinTarget"
                      name="proteinTarget"
                      type="number"
                      min="10"
                      max="300"
                      value={formData.proteinTarget}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="carbsTarget">Carbs (g)</Label>
                    <Input
                      id="carbsTarget"
                      name="carbsTarget"
                      type="number"
                      min="10"
                      max="500"
                      value={formData.carbsTarget}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fatTarget">Fat (g)</Label>
                    <Input
                      id="fatTarget"
                      name="fatTarget"
                      type="number"
                      min="10"
                      max="200"
                      value={formData.fatTarget}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="data">
                    Meal Plan Data (JSON)
                    <span className="text-sm text-gray-500 ml-2">Advanced</span>
                  </Label>
                  <Textarea
                    id="data"
                    name="data"
                    value={formData.data}
                    onChange={handleChange}
                    rows={8}
                    className="font-mono text-sm"
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                  disabled={isProcessing}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing ? (
                    <>
                      <Loader className="mr-2 h-4 w-4 animate-spin" />
                      {editingPreset ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      {editingPreset ? "Update Preset" : "Create Preset"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Available Preset Meal Plans</CardTitle>
          <CardDescription>
            Manage your meal plan presets that can be suggested to users based on their preferences.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : presets && presets.length > 0 ? (
            <Table>
              <TableCaption>A list of all preset meal plans.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Meals</TableHead>
                  <TableHead>Calories</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {presets.map((preset: any) => (
                  <TableRow key={preset.id}>
                    <TableCell className="font-medium">{preset.name}</TableCell>
                    <TableCell className="capitalize">{preset.category.replace('_', ' ')}</TableCell>
                    <TableCell>{preset.mealCount}</TableCell>
                    <TableCell>{preset.calorieTarget} cal</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleEdit(preset)}
                        disabled={isProcessing}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(preset.id)}
                        disabled={isProcessing}
                        className="text-destructive hover:text-destructive/90"
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No preset meal plans found. Click "Add New Preset" to create one.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}