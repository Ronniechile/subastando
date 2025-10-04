import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Shield, Plus, List, LogOut, Tag } from "lucide-react"
import { signOutAdmin, getCategories } from "@/lib/actions"
import CreateAuctionForm from "@/components/create-auction-form"
import AdminAuctionsList from "@/components/admin/admin-auctions-list"
import { CategoryManager } from "@/components/admin/category-manager"

export default async function AdminDashboard() {
  const categories = await getCategories()

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-purple-600 p-2 rounded-lg">
                <Shield className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
                <p className="text-sm text-gray-600">Gestiona las subastas de Subasport.com</p>
              </div>
            </div>
            <form action={signOutAdmin}>
              <Button variant="outline" size="sm">
                <LogOut className="h-4 w-4 mr-2" />
                Cerrar Sesión
              </Button>
            </form>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="create" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="create" className="flex items-center space-x-2">
              <Plus className="h-4 w-4" />
              <span>Crear Subasta</span>
            </TabsTrigger>
            <TabsTrigger value="manage" className="flex items-center space-x-2">
              <List className="h-4 w-4" />
              <span>Gestionar Subastas</span>
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center space-x-2">
              <Tag className="h-4 w-4" />
              <span>Categorías</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>Crear Nueva Subasta</CardTitle>
                <CardDescription>Agrega una nueva camiseta de equipo para subasta</CardDescription>
              </CardHeader>
              <CardContent>
                <CreateAuctionForm isAdmin={true} categories={categories} />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="manage">
            <Card>
              <CardHeader>
                <CardTitle>Gestionar Subastas</CardTitle>
                <CardDescription>Ve y administra todas las subastas activas</CardDescription>
              </CardHeader>
              <CardContent>
                <AdminAuctionsList />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="categories">
            <CategoryManager />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
