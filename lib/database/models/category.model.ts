import { model, models, Schema, Document } from "mongoose";

export interface ICategory extends Document {
  _id: string;
  name: string;
  parentCategory?: Schema.Types.ObjectId;
}

const CategorySchema = new Schema({
  name: { type: String, required: true, unique: true },
  parentCategory: {
    type: Schema.Types.ObjectId,
    ref: "Category",
    required: false,
  },
});

const Category = models.Category || model("Category", CategorySchema);

export default Category;
