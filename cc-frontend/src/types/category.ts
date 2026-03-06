export interface CategoryDetails {
    _id: string;
    name: string;
    slug: string;
    icon: string;
    image: string;
    parent: CategoryDetails | string | null ;
    order: number;
    createdAt: string;
    updatedAt: string; 
}

export interface CreateCategoryFormDetails {
  name: string
  icon: string
  parent: string
  order: string
  image: File | null
}

// export interface CreateCategoryFormDetails {
//     name: string; 
//     slug: string;
//     icon: string;
//     image: File;
//     order: number;
// }

export interface CategoryList {
    result: CategoryDetails[];
    total: number;
    page: number;
    pages: number;
}