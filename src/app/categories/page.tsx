import { NewCategoryForm } from "@/components/categories/new-category-form";
import { CategoryList } from "@/components/categories/category-list";
import { LabelModal } from "@/components/categories/label-modal";

export default function CategoriesPage() {
    return (
        <div className="flex flex-col gap-4.5">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h2 className="m-0 font-head text-2xl font-bold text-ink">Categorias e faixas</h2>
                    <p className="mt-1 mb-0 text-sm text-muted">Ajuste as faixas de custo usadas no empacotamento</p>
                </div>
            </div>
            <NewCategoryForm />
            <CategoryList />
            <LabelModal />
        </div>
    );
}
