import { PageHeader } from "@/components/layout/page-header";
import { PageContent } from "@/components/layout/page-content";
import { Shimmer } from "@/components/ui/shimmer";
import { NewCategoryForm } from "@/components/categories/new-category-form";
import { CategoryListSkeleton } from "@/components/categories/skeletons/category-list-skeleton";

export default function CategoriesLoading() {
    return (
        <>
            <PageHeader title="Categorias e faixas" subtitle="Ajuste as faixas de custo usadas no empacotamento">
                <Shimmer width="9.5rem" height="2rem" />
            </PageHeader>
            <PageContent>
                <div role="status" aria-label="Carregando categorias" className="contents">
                    <NewCategoryForm />
                    <CategoryListSkeleton />
                </div>
            </PageContent>
        </>
    );
}
