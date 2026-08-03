export interface Category {
  id: number;
  code: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRequest {
  code: string;
  name: string;
  description: string;
}

export interface CategoryFormData {
  code: string;
  name: string;
  description: string;
}

export const INITIAL_CATEGORY_FORM_DATA: CategoryFormData =
  {
    code: "",
    name: "",
    description: "",
  };
