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
import { Calendar, CheckCircle, AlertTriangle } from "lucide-react"

interface UpdateTechnicalInspectionDialogProps {
  vehicle: any
  onUpdate: (vehicleId: number, updates: any) => void
}

export function UpdateTechnicalInspectionDialog({ vehicle, onUpdate }: UpdateTechnicalInspectionDialogProps) {
  const [open, setOpen] = useState(false)
  const [newDate, setNewDate] = useState("")

  const getInspectionStatus = (date: string) => {
    const inspectionDate = new Date(date)
    const currentDate = new Date()
    const daysDiff = Math.ceil((inspectionDate - currentDate) / (1000 * 60 * 60 * 24))

    if (daysDiff < 0) return { status: "Expiré", color: "destructive", icon: AlertTriangle }
    if (daysDiff <= 30) return { status: "Urgent", color: "destructive", icon: AlertTriangle }
    if (daysDiff <= 90) return { status: "Bientôt", color: "secondary", icon: Calendar }
    return { status: "OK", color: "default", icon: CheckCircle }
  }

  const currentStatus = getInspectionStatus(vehicle.nextTechnicalInspection)
  const StatusIcon = currentStatus.icon

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newDate) return

    onUpdate(vehicle.id, {
      nextTechnicalInspection: newDate,
    })

    setNewDate("")
    setOpen(false)
  }

  // Calculer la date suggérée (1 an après la date actuelle)
  const suggestedDate = new Date()
  suggestedDate.setFullYear(suggestedDate.getFullYear() + 1)
  const suggestedDateString = suggestedDate.toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded">
          <Calendar className="mr-2 h-4 w-4" />
          Visite technique
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Calendar className="mr-2 h-5 w-5" />
            Mettre à jour la visite technique
          </DialogTitle>
          <DialogDescription>
            {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Statut actuel */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Statut actuel :</span>
              <Badge variant={currentStatus.color as any} className="flex items-center">
                <StatusIcon className="mr-1 h-3 w-3" />
                {currentStatus.status}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              Prochaine visite : {new Date(vehicle.nextTechnicalInspection).toLocaleDateString("fr-FR")}
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="newDate">Nouvelle date de visite technique</Label>
                <Input
                  id="newDate"
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  required
                />
                <div className="mt-2 text-xs text-gray-500">
                  Date suggérée (dans 1 an) : {new Date(suggestedDateString).toLocaleDateString("fr-FR")}
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="ml-2 h-auto p-0 text-xs"
                    onClick={() => setNewDate(suggestedDateString)}
                  >
                    Utiliser cette date
                  </Button>
                </div>
              </div>

              {/* Aperçu du nouveau statut */}
              {newDate && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="mr-2 h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-800">Nouveau statut :</span>
                  </div>
                  <div className="mt-1 text-sm text-green-700">
                    Visite technique programmée le {new Date(newDate).toLocaleDateString("fr-FR")}
                  </div>
                  <div className="mt-1 text-xs text-green-600">
                    {Math.ceil((new Date(newDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} jours
                    restants
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className="mt-6">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={!newDate}>
                <CheckCircle className="mr-2 h-4 w-4" />
                Mettre à jour
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  )
}
