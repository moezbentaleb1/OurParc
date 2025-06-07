"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
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
} from "@/components/ui/alert-dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Wrench, Plus, Edit, Trash2, Search, X } from "lucide-react"

interface MaintenanceTypesTabProps {
  interventionTypes: any[]
  onAddType: (type: any) => void
  onUpdateType: (typeId: number, updates: any) => void
  onDeleteType: (typeId: number) => void
}

export function MaintenanceTypesTab({
  interventionTypes,
  onAddType,
  onUpdateType,
  onDeleteType,
}: MaintenanceTypesTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [selectedType, setSelectedType] = useState(null)
  const [formData, setFormData] = useState({
    description: "",
    category: "",
    intervalTime: "",
    intervalKm: "",
  })

  // Obtenir les catégories uniques
  const categories = [...new Set(interventionTypes.map((type) => type.category))].sort()

  // Filtrer les types d'intervention
  const filteredTypes = interventionTypes.filter((type) => {
    const matchesSearch = searchTerm
      ? type.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.category.toLowerCase().includes(searchTerm.toLowerCase())
      : true
    const matchesCategory = selectedCategory === "all" || type.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const resetForm = () => {
    setFormData({
      description: "",
      category: "",
      intervalTime: "",
      intervalKm: "",
    })
  }

  const handleAdd = () => {
    setSelectedType(null)
    resetForm()
    setAddDialogOpen(true)
  }

  const handleEdit = (type) => {
    setSelectedType(type)
    setFormData({
      description: type.description,
      category: type.category,
      intervalTime: type.intervalTime?.toString() || "",
      intervalKm: type.intervalKm?.toString() || "",
    })
    setEditDialogOpen(true)
  }

  const handleSubmitAdd = (e) => {
    e.preventDefault()
    onAddType({
      description: formData.description,
      category: formData.category,
      intervalTime: formData.intervalTime ? Number.parseInt(formData.intervalTime) : null,
      intervalKm: formData.intervalKm ? Number.parseInt(formData.intervalKm) : null,
    })
    setAddDialogOpen(false)
    resetForm()
  }

  const handleSubmitEdit = (e) => {
    e.preventDefault()
    onUpdateType(selectedType.id, {
      description: formData.description,
      category: formData.category,
      intervalTime: formData.intervalTime ? Number.parseInt(formData.intervalTime) : null,
      intervalKm: formData.intervalKm ? Number.parseInt(formData.intervalKm) : null,
    })
    setEditDialogOpen(false)
    resetForm()
    setSelectedType(null)
  }

  const handleDelete = (typeId) => {
    onDeleteType(typeId)
  }

  const formatInterval = (type) => {
    const parts = []
    if (type.intervalKm) {
      parts.push(`${type.intervalKm.toLocaleString()} km`)
    }
    if (type.intervalTime) {
      const years = Math.floor(type.intervalTime / 12)
      const months = type.intervalTime % 12
      if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`)
      if (months > 0) parts.push(`${months} mois`)
    }
    return parts.length > 0 ? parts.join(" ou ") : "À la demande"
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center">
                <Wrench className="mr-2 h-5 w-5" />
                Gestion des Types d'Entretien
              </CardTitle>
              <CardDescription>
                Créer, modifier et supprimer les types d'intervention pour les entretiens
              </CardDescription>
            </div>
            <Button onClick={handleAdd}>
              <Plus className="mr-2 h-4 w-4" />
              Ajouter un type
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Filtres */}
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher un type d'intervention..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSearchTerm("")}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Toutes les catégories" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                <SelectItem value="all">Toutes les catégories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Statistiques */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total des types</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{interventionTypes.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Catégories</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{categories.length}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Résultats filtrés</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{filteredTypes.length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Tableau des types */}
          {filteredTypes.length > 0 ? (
            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Description</TableHead>
                    <TableHead>Catégorie</TableHead>
                    <TableHead>Intervalle</TableHead>
                    <TableHead className="w-32">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTypes.map((type) => (
                    <TableRow key={type.id}>
                      <TableCell>
                        <div className="max-w-md">
                          <div className="font-medium">{type.description}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{type.category}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">{formatInterval(type)}</TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(type)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Supprimer ce type d'intervention ?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Cette action est irréversible. Le type "{type.description}" sera définitivement
                                  supprimé.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Annuler</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(type.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Supprimer
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Wrench className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>
                {searchTerm || selectedCategory !== "all"
                  ? "Aucun type d'intervention trouvé avec ces filtres"
                  : "Aucun type d'intervention configuré"}
              </p>
              {(searchTerm || selectedCategory !== "all") && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm("")
                    setSelectedCategory("all")
                  }}
                  className="mt-4"
                >
                  Effacer les filtres
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog d'ajout */}
      <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Ajouter un nouveau type d'intervention</DialogTitle>
            <DialogDescription>Créer un nouveau type d'entretien avec ses intervalles de maintenance</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitAdd}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="description">Description de l'intervention</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Ex: MO VIDANGE MOTEUR+FILTRE A HUILE + FILTRE A AIR"
                  required
                  className="min-h-[60px]"
                />
              </div>

              <div>
                <Label htmlFor="category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une catégorie" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="Moteur">Moteur</SelectItem>
                    <SelectItem value="Freinage">Freinage</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                    <SelectItem value="Transmission">Transmission</SelectItem>
                    <SelectItem value="Climatisation">Climatisation</SelectItem>
                    <SelectItem value="Pneumatiques">Pneumatiques</SelectItem>
                    <SelectItem value="Filtration">Filtration</SelectItem>
                    <SelectItem value="Refroidissement">Refroidissement</SelectItem>
                    <SelectItem value="Carburant">Carburant</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="intervalTime">Intervalle en mois (optionnel)</Label>
                  <Input
                    id="intervalTime"
                    type="number"
                    value={formData.intervalTime}
                    onChange={(e) => setFormData({ ...formData, intervalTime: e.target.value })}
                    placeholder="Ex: 12"
                  />
                  <div className="text-xs text-gray-500 mt-1">Laisser vide si pas d'intervalle temporel</div>
                </div>
                <div>
                  <Label htmlFor="intervalKm">Intervalle en km (optionnel)</Label>
                  <Input
                    id="intervalKm"
                    type="number"
                    value={formData.intervalKm}
                    onChange={(e) => setFormData({ ...formData, intervalKm: e.target.value })}
                    placeholder="Ex: 10000"
                  />
                  <div className="text-xs text-gray-500 mt-1">Laisser vide si pas d'intervalle kilométrique</div>
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Aperçu de l'intervalle :</strong> {(() => {
                    const parts = []
                    if (formData.intervalKm) parts.push(`${Number.parseInt(formData.intervalKm).toLocaleString()} km`)
                    if (formData.intervalTime) {
                      const months = Number.parseInt(formData.intervalTime)
                      const years = Math.floor(months / 12)
                      const remainingMonths = months % 12
                      if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`)
                      if (remainingMonths > 0) parts.push(`${remainingMonths} mois`)
                    }
                    return parts.length > 0 ? parts.join(" ou ") : "À la demande"
                  })()}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setAddDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Ajouter</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog de modification */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Modifier le type d'intervention</DialogTitle>
            <DialogDescription>Modifier les informations de ce type d'entretien</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmitEdit}>
            <div className="grid gap-4 py-4">
              <div>
                <Label htmlFor="edit-description">Description de l'intervention</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  className="min-h-[60px]"
                />
              </div>

              <div>
                <Label htmlFor="edit-category">Catégorie</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                    <SelectItem value="Moteur">Moteur</SelectItem>
                    <SelectItem value="Freinage">Freinage</SelectItem>
                    <SelectItem value="Suspension">Suspension</SelectItem>
                    <SelectItem value="Transmission">Transmission</SelectItem>
                    <SelectItem value="Climatisation">Climatisation</SelectItem>
                    <SelectItem value="Pneumatiques">Pneumatiques</SelectItem>
                    <SelectItem value="Filtration">Filtration</SelectItem>
                    <SelectItem value="Refroidissement">Refroidissement</SelectItem>
                    <SelectItem value="Carburant">Carburant</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-intervalTime">Intervalle en mois (optionnel)</Label>
                  <Input
                    id="edit-intervalTime"
                    type="number"
                    value={formData.intervalTime}
                    onChange={(e) => setFormData({ ...formData, intervalTime: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-intervalKm">Intervalle en km (optionnel)</Label>
                  <Input
                    id="edit-intervalKm"
                    type="number"
                    value={formData.intervalKm}
                    onChange={(e) => setFormData({ ...formData, intervalKm: e.target.value })}
                  />
                </div>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-800">
                  <strong>Aperçu de l'intervalle :</strong> {(() => {
                    const parts = []
                    if (formData.intervalKm) parts.push(`${Number.parseInt(formData.intervalKm).toLocaleString()} km`)
                    if (formData.intervalTime) {
                      const months = Number.parseInt(formData.intervalTime)
                      const years = Math.floor(months / 12)
                      const remainingMonths = months % 12
                      if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`)
                      if (remainingMonths > 0) parts.push(`${remainingMonths} mois`)
                    }
                    return parts.length > 0 ? parts.join(" ou ") : "À la demande"
                  })()}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit">Enregistrer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
