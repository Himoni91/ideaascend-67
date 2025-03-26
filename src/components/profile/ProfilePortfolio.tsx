
import { useState } from "react";
import { ExtendedProfileType, PortfolioItem } from "@/types/profile-extended";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Image, Link, Plus, Edit, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useExtendedProfile } from "@/hooks/use-extended-profile";
import { motion, AnimatePresence } from "framer-motion";

interface ProfilePortfolioProps {
  profile: ExtendedProfileType;
  editable?: boolean;
}

export default function ProfilePortfolio({ profile, editable = false }: ProfilePortfolioProps) {
  const { updateProfile, uploadAvatar } = useExtendedProfile();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState<PortfolioItem | null>(null);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [tagInput, setTagInput] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  
  const portfolioItems = profile.portfolio_items || [];
  
  const handleAdd = () => {
    setCurrentItem({
      title: "",
      description: "",
      date: new Date().toISOString().split('T')[0],
      tags: []
    });
    setTagInput("");
    setImageFile(null);
    setImagePreview(null);
    setIsAddDialogOpen(true);
  };
  
  const handleEdit = (index: number) => {
    setCurrentItem(portfolioItems[index]);
    setTagInput("");
    setImageFile(null);
    setImagePreview(portfolioItems[index].image_url || null);
    setEditIndex(index);
    setIsEditDialogOpen(true);
  };
  
  const handleDelete = async (index: number) => {
    if (!confirm("Are you sure you want to remove this portfolio item?")) return;
    
    const newItems = [...portfolioItems];
    newItems.splice(index, 1);
    
    try {
      await updateProfile({ portfolio_items: newItems });
    } catch (error) {
      console.error("Failed to delete portfolio item:", error);
    }
  };
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        alert("Image size should be less than 5MB");
        return;
      }

      setImageFile(file);
      const preview = URL.createObjectURL(file);
      setImagePreview(preview);
    }
  };
  
  const clearImageSelection = () => {
    setImageFile(null);
    setImagePreview(currentItem?.image_url || null);
  };
  
  const addTag = () => {
    if (!tagInput.trim() || !currentItem) return;
    
    setCurrentItem(prev => {
      if (!prev) return null;
      const tags = prev.tags || [];
      if (!tags.includes(tagInput.trim())) {
        return { ...prev, tags: [...tags, tagInput.trim()] };
      }
      return prev;
    });
    
    setTagInput("");
  };
  
  const removeTag = (tag: string) => {
    setCurrentItem(prev => {
      if (!prev || !prev.tags) return prev;
      return {
        ...prev,
        tags: prev.tags.filter(t => t !== tag)
      };
    });
  };
  
  const handleSave = async () => {
    if (!currentItem) return;
    
    try {
      let imageUrl = currentItem.image_url;
      
      // Upload image if provided
      if (imageFile) {
        imageUrl = await uploadAvatar(imageFile); // Reusing avatar upload function
      }
      
      const itemToSave = {
        ...currentItem,
        image_url: imageUrl,
        date: currentItem.date || new Date().toISOString().split('T')[0]
      };
      
      const newItems = [...portfolioItems];
      
      if (isEditDialogOpen && editIndex >= 0) {
        // Edit existing
        newItems[editIndex] = itemToSave;
      } else {
        // Add new
        newItems.push(itemToSave);
      }
      
      await updateProfile({ portfolio_items: newItems });
      setIsAddDialogOpen(false);
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Failed to save portfolio item:", error);
    }
  };
  
  const renderPortfolioDialog = () => {
    const isOpen = isAddDialogOpen || isEditDialogOpen;
    const title = isAddDialogOpen ? "Add Portfolio Item" : "Edit Portfolio Item";
    
    return (
      <Dialog open={isOpen} onOpenChange={(open) => {
        if (!open) {
          setIsAddDialogOpen(false);
          setIsEditDialogOpen(false);
        }
      }}>
        <DialogContent className="sm:max-w-[525px]">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={currentItem?.title || ""}
                onChange={(e) => setCurrentItem(prev => 
                  prev ? { ...prev, title: e.target.value } : null
                )}
                placeholder="e.g. Idolyst Mobile App"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={currentItem?.description || ""}
                onChange={(e) => setCurrentItem(prev => 
                  prev ? { ...prev, description: e.target.value } : null
                )}
                placeholder="Brief description of your project"
                rows={3}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_url">Project URL (Optional)</Label>
                <Input
                  id="project_url"
                  value={currentItem?.project_url || ""}
                  onChange={(e) => setCurrentItem(prev => 
                    prev ? { ...prev, project_url: e.target.value } : null
                  )}
                  placeholder="https://example.com"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="date">Completion Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={currentItem?.date ? new Date(currentItem.date).toISOString().split('T')[0] : ""}
                  onChange={(e) => setCurrentItem(prev => 
                    prev ? { ...prev, date: e.target.value } : null
                  )}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Project Image</Label>
              <div className="flex items-center justify-center">
                {imagePreview ? (
                  <div className="relative w-full h-40 bg-muted rounded-md overflow-hidden">
                    <img 
                      src={imagePreview} 
                      alt="Project preview" 
                      className="w-full h-full object-cover"
                    />
                    <Button 
                      variant="destructive" 
                      size="icon"
                      className="absolute top-2 right-2 h-6 w-6 rounded-full"
                      onClick={clearImageSelection}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-md border-muted-foreground/25 cursor-pointer hover:border-muted-foreground/50 transition-colors">
                    <Image className="h-8 w-8 text-muted-foreground mb-2" />
                    <p className="text-sm text-muted-foreground">Click to upload image</p>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      id="portfolio-image" 
                      onChange={handleImageChange}
                    />
                    <Label 
                      htmlFor="portfolio-image" 
                      className="mt-2 cursor-pointer text-primary text-sm"
                    >
                      Browse files
                    </Label>
                  </div>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentItem?.tags?.map((tag, i) => (
                  <Badge key={i} variant="secondary" className="px-2 py-1">
                    {tag}
                    <button 
                      className="ml-1 text-xs hover:text-destructive" 
                      onClick={() => removeTag(tag)}
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex space-x-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  placeholder="e.g. React Native"
                  className="flex-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                />
                <Button type="button" onClick={addTag} size="sm">Add</Button>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddDialogOpen(false);
              setIsEditDialogOpen(false);
            }}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };
  
  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <div>
            <CardTitle className="text-xl flex items-center">
              <Image className="mr-2 h-5 w-5 text-idolyst-blue" />
              Portfolio
            </CardTitle>
            <CardDescription>
              Showcase of projects and work
            </CardDescription>
          </div>
          {editable && (
            <Button variant="ghost" size="sm" onClick={handleAdd}>
              <Plus className="h-4 w-4 mr-1" />
              Add
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {portfolioItems.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No portfolio items added yet.
              {editable && (
                <Button variant="link" onClick={handleAdd} className="mt-2">
                  Add Project
                </Button>
              )}
            </div>
          ) : (
            <motion.div 
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
              variants={container}
              initial="hidden"
              animate="show"
            >
              {portfolioItems.map((item, index) => (
                <motion.div 
                  key={index}
                  variants={item}
                  className="rounded-lg overflow-hidden border hover:shadow-md transition-shadow"
                >
                  {item.image_url && (
                    <div className="h-40 bg-muted overflow-hidden">
                      <img 
                        src={item.image_url} 
                        alt={item.title} 
                        className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      />
                    </div>
                  )}
                  <div className="p-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-medium text-base truncate mr-2">{item.title}</h3>
                      {editable && (
                        <div className="flex space-x-1 shrink-0">
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleEdit(index)}>
                            <Edit className="h-4 w-4 text-muted-foreground" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(index)}>
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.date && formatDate(new Date(item.date))}
                    </p>
                    <p className="text-sm mt-2 line-clamp-2">{item.description}</p>
                    {item.tags && item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-3">
                        {item.tags.map((tag, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    )}
                    {item.project_url && (
                      <a 
                        href={item.project_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary text-sm flex items-center mt-3 hover:underline"
                      >
                        <Link className="h-3.5 w-3.5 mr-1" />
                        View Project
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          )}
        </CardContent>
      </Card>
      
      {renderPortfolioDialog()}
    </>
  );
}
