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
import { Badge } from "@/components/ui/badge"
import { Gauge, AlertTriangle, TrendingUp } from "lucide-react"

interface UpdateMileageDialogProps {
  vehicle: any
  onUpdate: (vehicleId: number, updates: any) => void
}

export function UpdateMileageDialog({ vehicle, onUpdate }: UpdateMileageDialogProps) {
  const [open, setOpen] = useState(false)
  const [newMileage, setNewMileage] = useState(vehicle.mileage.toString())
  const [mileageError, setMileageError] = useState(false)

  const handleMileageChange = (value: string) => {
    const mileage = Number.parseInt(value, 10)
    if (!isNaN(mileage) && mileage < vehicle.mileage) {
      setMileageError(true)
    } else {
      setMileageError(false)
    }
    setNewMileage(value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const mileage = Number.parseInt(newMileage, 10)

    if (isNaN(mileage) || mileage < vehicle.mileage) return

    onUpdate(vehicle.id, {
      mileage: mileage,
    })

    setOpen(false)
  }

  const mileageDifference = Number.parseInt(newMileage, 10) - vehicle.mileage
  const isValidMileage = !isNaN(Number.parseInt(newMileage, 10)) && Number.parseInt(newMileage, 10) >= vehicle.mileage

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-6 px-2 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
        >
          <Gauge className="mr-1 h-3 w-3" />
          Actualiser
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Gauge className="mr-2 h-5 w-5" />
            Actualiser le kilométrage
          </DialogTitle>
          <DialogDescription>
            {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Kilométrage actuel */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Kilométrage actuel :</span>
              <Badge variant="outline" className="flex items-center">
                <Gauge className="mr-1 h-3 w-3" />
                {vehicle.mileage.toLocaleString()} km
              </Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newMileage">Nouveau kilométrage</Label>
                <Input
                  id="newMileage"
                  type="number"
                  value={newMileage}
                  onChange={(e) => handleMileageChange(e.target.value)}
                  min={vehicle.mileage}
                  required
                  className={mileageError ? "border-red-300 focus:border-red-500" : ""}
                />
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-gray-500">
                    Kilométrage minimum : {vehicle.mileage.toLocaleString()} km
                  </div>
                  {mileageError && (
                    <div className="text-xs text-red-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Kilométrage inférieur à l'actuel
                    </div>
                  )}
                </div>
              </div>

              {/* Aperçu de la différence */}
              {isValidMileage && mileageDifference > 0 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center text-green-800 text-sm">
                    <TrendingUp className="mr-2 h-4 w-4" />
                    <span className="font-medium">Augmentation :</span>
                  </div>
                  <div className="mt-1 text-sm text-green-700">
                    +{mileageDifference.toLocaleString()} km depuis la dernière mise à jour
                  </div>
                  <div className="mt-1 text-xs text-green-600">
                    Nouveau kilométrage : {Number.parseInt(newMileage).toLocaleString()} km
                  </div>
                </div>
              )}

              {isValidMileage && mileageDifference === 0 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm text-blue-800">Le kilométrage reste inchangé</div>
                </div>
              )}

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div className="flex items-center text-amber-800 text-sm">
                  <AlertTriangle className="mr-2 h-4 w-4" />
                  <span className="font-medium">Important :</span>
                </div>
                <div className="mt-1 text-sm text-amber-700">
                  Cette mise à jour sera utilisée pour calculer les prochaines échéances d'entretien.
                </div>
              </div>
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button
                type="submit"
                disabled={mileageError || !isValidMileage || mileageDifference === 0}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Gauge className="mr-2 h-4 w-4" />
                Mettre à jour
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
