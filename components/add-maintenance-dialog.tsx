"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Plus, AlertTriangle, Search, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface AddMaintenanceDialogProps {
  vehicle: any
  garages: any[]
  onAdd: (record: any) => void
  interventionTypes: any[]
}

export function AddMaintenanceDialog({ vehicle, garages, onAdd, interventionTypes }: AddMaintenanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    date: "",
    types: [],
    garageId: "",
    cost: "",
    description: "",
    mileageAtService: "",
  })
  const [mileageWarning, setMileageWarning] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")

  // Filtrer les interventions par recherche et catégorie
  const filteredInterventions = interventionTypes.filter((intervention) => {
    const matchesSearch = searchTerm
      ? intervention.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        intervention.category.toLowerCase().includes(searchTerm.toLowerCase())
      : true
    const matchesCategory = selectedCategory === "all" || intervention.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  // Obtenir les catégories uniques
  const categories = [...new Set(interventionTypes.map((type) => type.category))].sort()

  const handleTypeToggle = (intervention: any) => {
    const isSelected = formData.types.some((t) => t.id === intervention.id)
    const updatedTypes = isSelected
      ? formData.types.filter((t) => t.id !== intervention.id)
      : [...formData.types, intervention]
    setFormData({ ...formData, types: updatedTypes })
  }

  // Filtrer les garages actifs uniquement
  const activeGarages = garages.filter((garage) => garage.status === "active")

  // Vérifier le kilométrage
  const handleMileageChange = (value: string) => {
    const mileage = Number.parseInt(value, 10)
    if (!isNaN(mileage) && mileage < vehicle.mileage) {
      setMileageWarning(true)
    } else {
      setMileageWarning(false)
    }
    setFormData({ ...formData, mileageAtService: value })
  }

  const formatInterval = (intervention: any) => {
    const parts = []
    if (intervention.intervalKm) {
      parts.push(`${intervention.intervalKm.toLocaleString()} km`)
    }
    if (intervention.intervalTime) {
      const years = Math.floor(intervention.intervalTime / 12)
      const months = intervention.intervalTime % 12
      if (years > 0) parts.push(`${years} an${years > 1 ? "s" : ""}`)
      if (months > 0) parts.push(`${months} mois`)
    }
    return parts.length > 0 ? parts.join(" ou ") : "À la demande"
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData.types.length === 0) return

    onAdd({
      ...formData,
      type: formData.types.map((t) => t.description).join(", "), // Joindre les descriptions par des virgules
      vehicleId: vehicle.id,
      garageId: Number.parseInt(formData.garageId),
      cost: Number.parseFloat(formData.cost),
      mileageAtService: formData.mileageAtService ? Number.parseInt(formData.mileageAtService) : null,
    })
    setFormData({ date: "", types: [], garageId: "", cost: "", description: "", mileageAtService: "" })
    setMileageWarning(false)
    setSearchTerm("")
    setSelectedCategory("all")
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded">
          <Plus className="mr-2 h-4 w-4" />
          Nouvel entretien
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
          <DialogTitle>Nouvel entretien</DialogTitle>
          <DialogDescription>
            Enregistrer un entretien pour {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="overflow-x-hidden">
          <div className="grid gap-4 py-4 px-1">
            <div>
              <Label htmlFor="date">Date</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                required
              />
            </div>

            <div>
              <Label>Types d'intervention</Label>

              {/* Filtres pour les interventions */}
              <div className="flex gap-2 mt-2 mb-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher une intervention..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {searchTerm && (
                    <Button
                      type="button"
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
                    <SelectValue placeholder="Catégorie" />
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

              {/* Liste des interventions avec défilement */}
              <div className="border rounded-md max-h-64 overflow-y-auto">
                <div className="p-3 space-y-2">
                  {filteredInterventions.map((intervention) => {
                    const isSelected = formData.types.some((t) => t.id === intervention.id)
                    return (
                      <div
                        key={intervention.id}
                        className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-gray-200"
                        }`}
                        onClick={() => handleTypeToggle(intervention)}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleTypeToggle(intervention)}
                          className="mt-1 rounded border-gray-300"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-900 truncate">{intervention.description}</h4>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {intervention.category}
                            </Badge>
                          </div>
                          <div className="text-xs text-gray-500 mt-1">Intervalle: {formatInterval(intervention)}</div>
                        </div>
                      </div>
                    )
                  })}

                  {filteredInterventions.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <Search className="mx-auto h-8 w-8 text-gray-300 mb-2" />
                      <p className="text-sm">Aucune intervention trouvée</p>
                      {searchTerm && (
                        <Button
                          type="button"
                          variant="link"
                          size="sm"
                          onClick={() => setSearchTerm("")}
                          className="text-xs"
                        >
                          Effacer la recherche
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Interventions sélectionnées */}
              {formData.types.length > 0 && (
                <div className="mt-3">
                  <div className="text-xs text-gray-500 mb-2">
                    Interventions sélectionnées ({formData.types.length}) :
                  </div>
                  <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto p-2 bg-gray-50 rounded">
                    {formData.types.map((type) => (
                      <Badge key={type.id} variant="secondary" className="text-xs flex items-center">
                        {type.description.length > 30 ? `${type.description.substring(0, 30)}...` : type.description}
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTypeToggle(type)}
                          className="ml-1 h-3 w-3 p-0 hover:bg-gray-200"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {formData.types.length === 0 && (
                <div className="text-xs text-red-500 mt-1">Veuillez sélectionner au moins une intervention</div>
              )}
            </div>

            <div>
              <Label htmlFor="garage">Garage</Label>
              <Select
                value={formData.garageId}
                onValueChange={(value) => setFormData({ ...formData, garageId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un garage" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {activeGarages.map((garage) => (
                    <SelectItem key={garage.id} value={garage.id.toString()}>
                      {garage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {activeGarages.length === 0 && (
                <div className="text-xs text-red-500 mt-1">
                  Aucun garage actif disponible. Veuillez activer un garage dans l'onglet Gestion.
                </div>
              )}
            </div>

            <div>
              <Label htmlFor="cost">Coût (€)</Label>
              <Input
                id="cost"
                type="number"
                step="0.01"
                value={formData.cost}
                onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                required
              />
            </div>

            <div>
              <Label htmlFor="mileageAtService">Kilométrage au moment de l'entretien</Label>
              <Input
                id="mileageAtService"
                type="number"
                value={formData.mileageAtService}
                onChange={(e) => handleMileageChange(e.target.value)}
                placeholder={`Actuel: ${vehicle.mileage.toLocaleString()} km`}
              />
              <div className="flex items-center justify-between mt-1">
                <div className="text-xs text-gray-500">
                  Kilométrage actuel du véhicule: {vehicle.mileage.toLocaleString()} km
                </div>
                {mileageWarning && (
                  <div className="text-xs text-amber-600 flex items-center">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Kilométrage inférieur à l'actuel
                  </div>
                )}
              </div>
              <div className="text-xs text-blue-600 mt-1">
                Si le kilométrage est supérieur à l'actuel, il sera automatiquement mis à jour.
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description complémentaire</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Détails supplémentaires, observations, pièces remplacées..."
                className="min-h-[80px] max-h-32 resize-none"
              />
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button type="submit" disabled={activeGarages.length === 0 || formData.types.length === 0}>
              Enregistrer l'entretien
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
