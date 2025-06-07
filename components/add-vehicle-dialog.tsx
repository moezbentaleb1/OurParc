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
import { Plus } from "lucide-react"

interface AddVehicleDialogProps {
  onAdd: (vehicle: any) => void
  drivers: any[]
}

export function AddVehicleDialog({ onAdd, drivers }: AddVehicleDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    licensePlate: "",
    driverId: "",
    mileage: "",
    lastMaintenance: "",
    nextTechnicalInspection: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAdd({
      ...formData,
      year: Number.parseInt(formData.year),
      mileage: Number.parseInt(formData.mileage),
      driverId: Number.parseInt(formData.driverId),
      status: "active", // Ajouter le statut par défaut
      outOfServiceDate: null, // Pas de date de mise hors service par défaut
    })
    setFormData({
      brand: "",
      model: "",
      year: "",
      licensePlate: "",
      driverId: "",
      mileage: "",
      lastMaintenance: "",
      nextTechnicalInspection: "",
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Ajouter Véhicule
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px] max-h-[85vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
          <DialogTitle>Ajouter un nouveau véhicule</DialogTitle>
          <DialogDescription>Remplissez les informations du véhicule à ajouter au parc.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="overflow-x-hidden">
          <div className="grid gap-4 py-4 px-1">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="brand">Marque</Label>
                <Input
                  id="brand"
                  value={formData.brand}
                  onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="model">Modèle</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="year">Année</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="licensePlate">Plaque</Label>
                <Input
                  id="licensePlate"
                  value={formData.licensePlate}
                  onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value })}
                  placeholder="AB-123-CD"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="driver">Chauffeur</Label>
              <Select
                value={formData.driverId}
                onValueChange={(value) => setFormData({ ...formData, driverId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner un chauffeur" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mileage">Kilométrage</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lastMaintenance">Dernier entretien</Label>
                <Input
                  id="lastMaintenance"
                  type="date"
                  value={formData.lastMaintenance}
                  onChange={(e) => setFormData({ ...formData, lastMaintenance: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="nextTechnicalInspection">Prochaine visite technique</Label>
                <Input
                  id="nextTechnicalInspection"
                  type="date"
                  value={formData.nextTechnicalInspection}
                  onChange={(e) => setFormData({ ...formData, nextTechnicalInspection: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button type="submit">Ajouter</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
