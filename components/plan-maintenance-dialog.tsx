"use client"

import { useState, useMemo } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Calendar, AlertTriangle, Clock, CheckCircle, Gauge, CalendarDays, Plus, Wrench } from "lucide-react"

interface PlanMaintenanceDialogProps {
  vehicle: any
  interventionTypes: any[]
  maintenanceRecords: any[]
  garages?: any[]
  onAddMaintenance?: (record: any) => void
}

export function PlanMaintenanceDialog({
  vehicle,
  interventionTypes,
  maintenanceRecords,
  garages = [],
  onAddMaintenance,
}: PlanMaintenanceDialogProps) {
  const [open, setOpen] = useState(false)
  const [addMaintenanceOpen, setAddMaintenanceOpen] = useState(false)
  const [selectedInterventions, setSelectedInterventions] = useState([])
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    garageId: "",
    cost: "",
    description: "",
    mileageAtService: vehicle.mileage.toString(),
  })
  const [mileageError, setMileageError] = useState(false)

  // Calculer les interventions dues pour ce véhicule
  const plannedInterventions = useMemo(() => {
    const results = []
    const today = new Date()

    interventionTypes.forEach((intervention) => {
      // Trouver la dernière fois que cette intervention a été effectuée
      const lastIntervention = maintenanceRecords
        .filter(
          (record) =>
            record.vehicleId === vehicle.id &&
            (record.type.toLowerCase().includes(intervention.description.toLowerCase().split(" ")[0]) ||
              record.type.toLowerCase().includes(intervention.description.toLowerCase().split(" ")[1]) ||
              intervention.description.toLowerCase().includes(record.type.toLowerCase().split(" ")[0])),
        )
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

      let isOverdue = false
      let isDueSoon = false
      let daysUntilDue = null
      let kmUntilDue = null
      let status = "ok"
      let priority = 0

      // Vérifier l'échéance basée sur le kilométrage
      if (intervention.intervalKm) {
        const lastKm = lastIntervention?.mileageAtService || 0
        const kmSinceLastIntervention = vehicle.mileage - lastKm
        kmUntilDue = intervention.intervalKm - kmSinceLastIntervention

        if (kmUntilDue <= 0) {
          isOverdue = true
          status = "overdue"
          priority = 3
        } else if (kmUntilDue <= intervention.intervalKm * 0.1) {
          // 10% de l'intervalle
          isDueSoon = true
          status = "due_soon"
          priority = 2
        }
      }

      // Vérifier l'échéance basée sur le temps
      if (intervention.intervalTime) {
        const lastDate = lastIntervention ? new Date(lastIntervention.date) : new Date(vehicle.lastMaintenance)
        const nextDueDate = new Date(lastDate)
        nextDueDate.setMonth(nextDueDate.getMonth() + intervention.intervalTime)

        daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

        if (daysUntilDue <= 0) {
          isOverdue = true
          status = "overdue"
          priority = Math.max(priority, 3)
        } else if (daysUntilDue <= 30) {
          // Dans les 30 prochains jours
          isDueSoon = true
          status = status === "ok" ? "due_soon" : status
          priority = Math.max(priority, 2)
        }
      }

      // Si les deux critères existent, prendre le plus restrictif
      if (intervention.intervalKm && intervention.intervalTime) {
        if (kmUntilDue <= 0 || daysUntilDue <= 0) {
          status = "overdue"
          priority = 3
        } else if (kmUntilDue <= intervention.intervalKm * 0.1 || daysUntilDue <= 30) {
          status = "due_soon"
          priority = 2
        }
      }

      // Ajouter seulement les interventions dues ou bientôt dues
      if (isOverdue || isDueSoon) {
        results.push({
          intervention,
          lastIntervention,
          isOverdue,
          isDueSoon,
          daysUntilDue,
          kmUntilDue,
          status,
          priority,
        })
      }
    })

    // Trier par priorité (en retard d'abord, puis bientôt dues)
    return results.sort((a, b) => b.priority - a.priority)
  }, [vehicle, interventionTypes, maintenanceRecords])

  // Filtrer les garages actifs
  const activeGarages = garages.filter((garage) => garage.status === "active")

  const handleInterventionToggle = (intervention) => {
    const isSelected = selectedInterventions.some((i) => i.id === intervention.id)
    if (isSelected) {
      setSelectedInterventions(selectedInterventions.filter((i) => i.id !== intervention.id))
    } else {
      setSelectedInterventions([...selectedInterventions, intervention])
    }
  }

  const handleMileageChange = (value) => {
    const mileage = Number.parseInt(value, 10)
    if (!isNaN(mileage) && mileage < vehicle.mileage) {
      setMileageError(true)
    } else {
      setMileageError(false)
    }
    setFormData({ ...formData, mileageAtService: value })
  }

  const handleAddMaintenance = (e) => {
    e.preventDefault()
    if (selectedInterventions.length === 0 || !onAddMaintenance) return

    const maintenanceRecord = {
      vehicleId: vehicle.id,
      type: selectedInterventions.map((i) => i.description).join(", "),
      date: formData.date,
      garageId: Number.parseInt(formData.garageId),
      cost: Number.parseFloat(formData.cost),
      description: formData.description,
      mileageAtService: Number.parseInt(formData.mileageAtService),
    }

    onAddMaintenance(maintenanceRecord)

    // Réinitialiser le formulaire
    setSelectedInterventions([])
    setFormData({
      date: new Date().toISOString().split("T")[0],
      garageId: "",
      cost: "",
      description: "",
      mileageAtService: vehicle.mileage.toString(),
    })
    setMileageError(false)
    setAddMaintenanceOpen(false)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "overdue":
        return (
          <Badge variant="destructive" className="flex items-center">
            <AlertTriangle className="mr-1 h-3 w-3" />
            En retard
          </Badge>
        )
      case "due_soon":
        return (
          <Badge variant="secondary" className="flex items-center bg-orange-100 text-orange-800">
            <Clock className="mr-1 h-3 w-3" />
            Bientôt
          </Badge>
        )
      default:
        return (
          <Badge variant="default" className="flex items-center bg-green-100 text-green-800">
            <CheckCircle className="mr-1 h-3 w-3" />
            OK
          </Badge>
        )
    }
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
    return parts.join(" ou ")
  }

  const formatNextDue = (item: any) => {
    const parts = []
    if (item.kmUntilDue !== null) {
      if (item.kmUntilDue <= 0) {
        parts.push(`${Math.abs(item.kmUntilDue).toLocaleString()} km de retard`)
      } else {
        parts.push(`dans ${item.kmUntilDue.toLocaleString()} km`)
      }
    }
    if (item.daysUntilDue !== null) {
      if (item.daysUntilDue <= 0) {
        parts.push(`${Math.abs(item.daysUntilDue)} jour${Math.abs(item.daysUntilDue) > 1 ? "s" : ""} de retard`)
      } else {
        parts.push(`dans ${item.daysUntilDue} jour${item.daysUntilDue > 1 ? "s" : ""}`)
      }
    }
    return parts.join(" ou ")
  }

  const overdueCount = plannedInterventions.filter((item) => item.status === "overdue").length
  const dueSoonCount = plannedInterventions.filter((item) => item.status === "due_soon").length

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <div className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded">
            <Calendar className="mr-2 h-4 w-4" />
            Planifier
            {plannedInterventions.length > 0 && (
              <Badge variant="secondary" className="ml-2 h-5 text-xs">
                {plannedInterventions.length}
              </Badge>
            )}
          </div>
        </DialogTrigger>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
            <DialogTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Planification des interventions - {vehicle.brand} {vehicle.model}
            </DialogTitle>
            <DialogDescription>
              Plaque: {vehicle.licensePlate} | Kilométrage actuel: {vehicle.mileage.toLocaleString()} km | Date:{" "}
              {new Date().toLocaleDateString("fr-FR")}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 px-1 overflow-x-hidden">
            {/* Statistiques de planification */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">En retard</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{overdueCount}</div>
                  <p className="text-xs text-muted-foreground">Interventions urgentes</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">À venir</CardTitle>
                  <Clock className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{dueSoonCount}</div>
                  <p className="text-xs text-muted-foreground">Dans les 30 jours</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                  <CalendarDays className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{plannedInterventions.length}</div>
                  <p className="text-xs text-muted-foreground">Interventions planifiées</p>
                </CardContent>
              </Card>
            </div>

            {/* Informations du véhicule */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Gauge className="mr-2 h-4 w-4" />
                  Informations du véhicule
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Marque:</span>
                    <div>{vehicle.brand}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Modèle:</span>
                    <div>{vehicle.model}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Année:</span>
                    <div>{vehicle.year}</div>
                  </div>
                  <div>
                    <span className="font-medium text-gray-700">Kilométrage:</span>
                    <div className="font-semibold text-blue-600">{vehicle.mileage.toLocaleString()} km</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Liste des interventions planifiées */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CalendarDays className="mr-2 h-4 w-4" />
                  Interventions à planifier
                </CardTitle>
              </CardHeader>
              <CardContent>
                {plannedInterventions.length > 0 ? (
                  <div className="max-h-96 overflow-y-auto border rounded">
                    <Table>
                      <TableHeader className="sticky top-0 bg-white z-10">
                        <TableRow>
                          <TableHead>Priorité</TableHead>
                          <TableHead>Intervention</TableHead>
                          <TableHead>Catégorie</TableHead>
                          <TableHead>Intervalle</TableHead>
                          <TableHead>Échéance</TableHead>
                          <TableHead>Dernière fois</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {plannedInterventions.map((item, index) => (
                          <TableRow key={index} className={item.status === "overdue" ? "bg-red-50" : "bg-orange-50"}>
                            <TableCell>{getStatusBadge(item.status)}</TableCell>
                            <TableCell>
                              <div className="max-w-xs">
                                <div className="font-medium text-sm">{item.intervention.description}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline">{item.intervention.category}</Badge>
                            </TableCell>
                            <TableCell className="text-sm">{formatInterval(item.intervention)}</TableCell>
                            <TableCell
                              className={`text-sm font-medium ${
                                item.status === "overdue" ? "text-red-600" : "text-orange-600"
                              }`}
                            >
                              {formatNextDue(item)}
                            </TableCell>
                            <TableCell className="text-sm">
                              {item.lastIntervention ? (
                                <div>
                                  <div>{new Date(item.lastIntervention.date).toLocaleDateString("fr-FR")}</div>
                                  {item.lastIntervention.mileageAtService && (
                                    <div className="text-xs text-gray-500">
                                      {item.lastIntervention.mileageAtService.toLocaleString()} km
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <span className="text-gray-400 italic">Jamais effectuée</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="mx-auto h-12 w-12 text-green-300 mb-4" />
                    <p className="text-lg font-medium">Aucune intervention due</p>
                    <p className="text-sm mt-2">
                      Toutes les interventions sont à jour selon le kilométrage actuel et la date courante
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recommandations */}
            {plannedInterventions.length > 0 && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Recommandations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm text-blue-800">
                    {overdueCount > 0 && (
                      <div className="flex items-center">
                        <AlertTriangle className="mr-2 h-4 w-4 text-red-500" />
                        <span>
                          <strong>{overdueCount}</strong> intervention{overdueCount > 1 ? "s" : ""} en retard -{" "}
                          <strong>Planifier immédiatement</strong>
                        </span>
                      </div>
                    )}
                    {dueSoonCount > 0 && (
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4 text-orange-500" />
                        <span>
                          <strong>{dueSoonCount}</strong> intervention{dueSoonCount > 1 ? "s" : ""} à venir -{" "}
                          <strong>Planifier dans les prochaines semaines</strong>
                        </span>
                      </div>
                    )}
                    <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                      <p className="font-medium">💡 Conseil :</p>
                      <p>
                        Groupez les interventions de même catégorie pour optimiser les coûts et réduire les temps
                        d'immobilisation du véhicule.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Bouton d'ajout d'intervention */}
          {plannedInterventions.length > 0 && onAddMaintenance && activeGarages.length > 0 && (
            <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
              <Button onClick={() => setAddMaintenanceOpen(true)} className="w-full">
                <Plus className="mr-2 h-4 w-4" />
                Ajouter une intervention planifiée
              </Button>
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog d'ajout d'intervention */}
      <Dialog open={addMaintenanceOpen} onOpenChange={setAddMaintenanceOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[85vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <DialogTitle className="flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              Ajouter une intervention planifiée
            </DialogTitle>
            <DialogDescription>
              {vehicle.brand} {vehicle.model} ({vehicle.licensePlate}) - Kilométrage: {vehicle.mileage.toLocaleString()}{" "}
              km
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddMaintenance} className="overflow-x-hidden">
            <div className="grid gap-4 py-4 px-1">
              {/* Sélection des interventions */}
              <div>
                <Label>Interventions à effectuer</Label>
                <div className="mt-2 border rounded-md overflow-hidden">
                  <div className="max-h-[300px] overflow-y-auto p-3 space-y-2 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
                    {plannedInterventions.map((item, index) => {
                      const isSelected = selectedInterventions.some((i) => i.id === item.intervention.id)
                      return (
                        <div
                          key={index}
                          className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                            isSelected ? "bg-blue-50 border-blue-200" : "hover:bg-gray-50 border-gray-200"
                          }`}
                          onClick={() => handleInterventionToggle(item.intervention)}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => handleInterventionToggle(item.intervention)}
                            className="mt-1 rounded border-gray-300"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="text-sm font-medium text-gray-900 truncate">
                                {item.intervention.description}
                              </h4>
                              <div className="flex items-center space-x-2 ml-2">
                                {getStatusBadge(item.status)}
                                <Badge variant="outline" className="text-xs">
                                  {item.intervention.category}
                                </Badge>
                              </div>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">{formatNextDue(item)}</div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
                {selectedInterventions.length === 0 && (
                  <div className="text-xs text-red-500 mt-1">Veuillez sélectionner au moins une intervention</div>
                )}
              </div>

              {/* Date */}
              <div>
                <Label htmlFor="date">Date d'intervention</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <div className="text-xs text-gray-500 mt-1">
                  Date par défaut: aujourd'hui ({new Date().toLocaleDateString("fr-FR")})
                </div>
              </div>

              {/* Garage */}
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
              </div>

              {/* Kilométrage */}
              <div>
                <Label htmlFor="mileageAtService">Kilométrage au moment de l'intervention</Label>
                <Input
                  id="mileageAtService"
                  type="number"
                  value={formData.mileageAtService}
                  onChange={(e) => handleMileageChange(e.target.value)}
                  min={vehicle.mileage}
                  required
                />
                <div className="flex items-center justify-between mt-1">
                  <div className="text-xs text-gray-500">
                    Kilométrage minimum: {vehicle.mileage.toLocaleString()} km
                  </div>
                  {mileageError && (
                    <div className="text-xs text-red-600 flex items-center">
                      <AlertTriangle className="h-3 w-3 mr-1" />
                      Kilométrage inférieur à l'actuel
                    </div>
                  )}
                </div>
              </div>

              {/* Coût */}
              <div>
                <Label htmlFor="cost">Coût estimé (€)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
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
              <Button type="button" variant="outline" onClick={() => setAddMaintenanceOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" disabled={selectedInterventions.length === 0 || !formData.garageId || mileageError}>
                Enregistrer l'intervention
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  )
}
