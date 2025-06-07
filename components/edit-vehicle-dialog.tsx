"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Settings } from "lucide-react"

interface EditVehicleDialogProps {
  vehicle: any
  drivers: any[]
  onUpdate: (vehicleId: number, updates: any) => void
}

export function EditVehicleDialog({ vehicle, drivers, onUpdate }: EditVehicleDialogProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    licensePlate: "",
    driverId: "",
    mileage: "",
  })

  // Initialiser le formulaire avec les données du véhicule
  useEffect(() => {
    if (open) {
      setFormData({
        brand: vehicle.brand,
        model: vehicle.model,
        year: vehicle.year.toString(),
        licensePlate: vehicle.licensePlate,
        driverId: vehicle.driverId.toString(),
        mileage: vehicle.mileage.toString(),
      })
    }
  }, [open, vehicle])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onUpdate(vehicle.id, {
      brand: formData.brand,
      model: formData.model,
      year: Number.parseInt(formData.year),
      licensePlate: formData.licensePlate,
      driverId: Number.parseInt(formData.driverId),
      mileage: Number.parseInt(formData.mileage),
    })
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded">
          <Settings className="mr-2 h-4 w-4" />
          Modifier le véhicule
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[650px]">
        <DialogHeader>
          <DialogTitle>Modifier les informations du véhicule</DialogTitle>
          <DialogDescription>
            Mettre à jour les informations de {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
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
                <SelectContent>
                  {drivers.map((driver) => (
                    <SelectItem key={driver.id} value={driver.id.toString()}>
                      {driver.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="mileage">Kilométrage actuel</Label>
              <Input
                id="mileage"
                type="number"
                value={formData.mileage}
                onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Annuler
            </Button>
            <Button type="submit">Enregistrer les modifications</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
