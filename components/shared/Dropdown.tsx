import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { ICategory } from "@/lib/database/models/category.model";
import { startTransition, use, useEffect, useState } from "react";
import { Input } from "../ui/input";
import {
  createCategory,
  getAllCategories,
} from "@/lib/actions/category.actions";

interface DropdownProps {
  onChangeHandler?: () => void;
  value?: string;
}
const Dropdown = ({ onChangeHandler, value }: DropdownProps) => {
  const [Categories, setCategories] = useState<ICategory[]>([]);
  const [newCategory, setNewCategory] = useState<string>("");

  const handleAddCategory = async () => {
    createCategory({
      categoryName: newCategory.trim(),
    }).then((category: ICategory) => {
      setCategories((prevState) => [...prevState, category]);
    });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      const response = await getAllCategories();
      response && setCategories(response as ICategory[]);
    };
    fetchCategories();
  }, []);

  return (
    <Select onValueChange={onChangeHandler} defaultValue={value}>
      <SelectTrigger className="w-full select-field">
        <SelectValue placeholder="Category" />
      </SelectTrigger>
      <SelectContent>
        {Categories.length > 0 &&
          Categories.map((category) => (
            <SelectItem
              key={category._id}
              value={category._id}
              className="p-regular-14"
            >
              {category.name}
            </SelectItem>
          ))}
        <AlertDialog>
          <AlertDialogTrigger className="p-medium-14 flex w-full rounded-sm py-3 pl-8 text-primary-500 hover:bg-primary-50">
            Add New Category
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white">
            <AlertDialogHeader>
              <AlertDialogTitle>New Category</AlertDialogTitle>
              <AlertDialogDescription>
                <Input
                  placeholder="Category Name"
                  type="text"
                  className="my-2 input-field"
                  onChange={(e) => {
                    setNewCategory(e.target.value);
                  }}
                />
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => startTransition(handleAddCategory)}
              >
                Add
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </SelectContent>
    </Select>
  );
};

export default Dropdown;
