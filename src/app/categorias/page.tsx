import { NewCategoryForm } from "@/components/categories/new-category-form";
import { CategorySearch } from "@/components/categories/category-search";
import { CategoryList } from "@/components/categories/category-list";
import { LabelModal } from "@/components/categories/label-modal";
import { PrintLabelsButton } from "@/components/categories/print-labels-button";
import { PageHeader } from "@/components/layout/page-header";
import { PageContent } from "@/components/layout/page-content";

export default function Page() {
    return (
        <>
            <PageHeader title="Categorias e faixas" subtitle="Ajuste as faixas de custo usadas no empacotamento">
                <PrintLabelsButton />
            </PageHeader>
            <PageContent>
                <NewCategoryForm />
                <CategorySearch />
                <CategoryList />
                <LabelModal />
            </PageContent>
        </>
    );
}
