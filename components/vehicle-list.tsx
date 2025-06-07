"use client"

import { DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Car, User, Calendar, Gauge, Search, X } from "lucide-react"
import { AddMaintenanceDialog } from "./add-maintenance-dialog"
import { VehicleHistoryDialog } from "./vehicle-history-dialog"
import { UpdateTechnicalInspectionDialog } from "./update-technical-inspection-dialog"
import { EditVehicleDialog } from "./edit-vehicle-dialog"
import { UpdateMileageDialog } from "./update-mileage-dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PlanMaintenanceDialog } from "./plan-maintenance-dialog"

interface VehicleListProps {
  vehicles: any[]
  drivers: any[]
  onAddMaintenance: (record: any) => void
  garages: any[]
  maintenanceRecords: any[]
  onUpdateVehicle: (vehicleId: number, updates: any) => void
  interventionTypes: any[]
}

export function VehicleList({
  vehicles,
  drivers,
  onAddMaintenance,
  garages,
  maintenanceRecords,
  onUpdateVehicle,
  interventionTypes,
}: VehicleListProps) {
  const [searchTerm, setSearchTerm] = useState("")

  const getDriverName = (driverId: number) => {
    const driver = drivers.find((d) => d.id === driverId)
    if (!driver) return "Non assigné"

    const isDriverOutOfService = driver.status === "out-of-service"
    return isDriverOutOfService ? `${driver.name} (Hors Service)` : driver.name
  }

  const getInspectionStatus = (date: string) => {
    const inspectionDate = new Date(date)
    const currentDate = new Date()
    const daysDiff = Math.ceil((inspectionDate - currentDate) / (1000 * 60 * 60 * 24))

    if (daysDiff < 0) return { status: "Expiré", color: "destructive" }
    if (daysDiff <= 30) return { status: "Urgent", color: "destructive" }
    if (daysDiff <= 90) return { status: "Bientôt", color: "secondary" }
    return { status: "OK", color: "default" }
  }

  const getLastOilChange = (vehicleId: number) => {
    const vehicleRecords = maintenanceRecords.filter((record) => record.vehicleId === vehicleId)
    const oilChangeRecords = vehicleRecords.filter(
      (record) => record.type.toLowerCase().includes("vidange") || record.type.toLowerCase().includes("huile"),
    )

    if (oilChangeRecords.length === 0) return null

    const lastOilChange = oilChangeRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    return lastOilChange
  }

  // Fonction de filtrage des véhicules
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!searchTerm) return true

    const searchLower = searchTerm.toLowerCase()
    const driverName = getDriverName(vehicle.driverId).toLowerCase()

    return (
      vehicle.brand.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate.toLowerCase().includes(searchLower) ||
      vehicle.year.toString().includes(searchLower) ||
      driverName.includes(searchLower)
    )
  })

  const clearSearch = () => {
    setSearchTerm("")
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <Car className="mr-2 h-5 w-5" />
              Parc Automobile
            </CardTitle>
            <CardDescription>Gestion et suivi de tous les véhicules</CardDescription>
          </div>

          {/* Champ de recherche */}
          <div className="relative w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher par marque, modèle, plaque ou chauffeur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
        </div>

        {/* Indicateur de résultats de recherche */}
        {searchTerm && (
          <div className="mt-2 text-sm text-gray-600">
            {filteredVehicles.length} véhicule{filteredVehicles.length !== 1 ? "s" : ""} trouvé
            {filteredVehicles.length !== 1 ? "s" : ""} pour "{searchTerm}"
            {filteredVehicles.length === 0 && (
              <span className="ml-2 text-gray-500">- Essayez avec d'autres mots-clés</span>
            )}
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          {filteredVehicles.length === 0 && !searchTerm && (
            <div className="text-center py-8 text-gray-500">
              <Car className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Aucun véhicule enregistré pour le moment</p>
            </div>
          )}

          {filteredVehicles.length === 0 && searchTerm && (
            <div className="text-center py-8 text-gray-500">
              <Search className="mx-auto h-12 w-12 text-gray-300 mb-4" />
              <p>Aucun véhicule ne correspond à votre recherche</p>
              <p className="text-sm mt-2">Essayez avec d'autres mots-clés ou effacez la recherche</p>
              <Button variant="outline" onClick={clearSearch} className="mt-4">
                Effacer la recherche
              </Button>
            </div>
          )}

          {filteredVehicles.map((vehicle) => {
            const inspectionStatus = getInspectionStatus(vehicle.nextTechnicalInspection)
            const isOutOfService = vehicle.status === "out-of-service"
            const driver = drivers.find((d) => d.id === vehicle.driverId)
            const isDriverOutOfService = driver?.status === "out-of-service"

            return (
              <div
                key={vehicle.id}
                className={`border rounded-lg p-4 ${isOutOfService ? "bg-gray-100 opacity-75" : "hover:bg-gray-50"}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <h3 className="text-lg font-semibold mr-3">
                        {vehicle.brand} {vehicle.model} ({vehicle.year})
                        {isOutOfService && <span className="text-orange-600 ml-2">(Hors Service)</span>}
                      </h3>
                      <Badge variant="outline">{vehicle.licensePlate}</Badge>
                      {isOutOfService && (
                        <Badge variant="secondary" className="ml-2 bg-orange-100 text-orange-800">
                          Hors Service
                        </Badge>
                      )}
                    </div>

                    {/* Afficher la date de mise hors service */}
                    {isOutOfService && vehicle.outOfServiceDate && (
                      <div className="mb-2 text-sm text-orange-600 font-medium">
                        🔧 Hors service depuis le {new Date(vehicle.outOfServiceDate).toLocaleDateString("fr-FR")}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span className={isDriverOutOfService ? "text-orange-600" : ""}>
                          Chauffeur: {getDriverName(vehicle.driverId)}
                        </span>
                      </div>

                      <div className="flex items-center">
                        <Gauge className="mr-2 h-4 w-4" />
                        <div className="flex flex-col flex-1">
                          <div className="flex items-center justify-between">
                            <span>Kilométrage: {vehicle.mileage.toLocaleString()} km</span>
                            {!isOutOfService && <UpdateMileageDialog vehicle={vehicle} onUpdate={onUpdateVehicle} />}
                          </div>
                          {(() => {
                            const lastOilChange = getLastOilChange(vehicle.id)
                            return lastOilChange ? (
                              <span className="text-xs text-gray-500 ml-6">
                                Dernière vidange: {new Date(lastOilChange.date).toLocaleDateString("fr-FR")}
                                {lastOilChange.mileageAtService &&
                                  ` - ${lastOilChange.mileageAtService.toLocaleString()} km`}
                              </span>
                            ) : (
                              <span className="text-xs text-gray-500 ml-6">Aucune vidange enregistrée</span>
                            )
                          })()}
                        </div>
                      </div>

                      <div className="flex items-center">
                        <Calendar className="mr-2 h-4 w-4" />
                        <div className="flex flex-col">
                          {(() => {
                            const vehicleRecords = maintenanceRecords.filter(
                              (record) => record.vehicleId === vehicle.id,
                            )
                            if (vehicleRecords.length === 0) {
                              return (
                                <>
                                  <span>
                                    Dernier entretien: {new Date(vehicle.lastMaintenance).toLocaleDateString("fr-FR")}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-6">Aucun détail disponible</span>
                                </>
                              )
                            }

                            const lastRecord = vehicleRecords.sort(
                              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
                            )[0]
                            const daysSinceLastMaintenance = Math.floor(
                              (new Date().getTime() - new Date(lastRecord.date).getTime()) / (1000 * 60 * 60 * 24),
                            )
                            const maintenanceAge =
                              daysSinceLastMaintenance <= 30
                                ? "text-green-600"
                                : daysSinceLastMaintenance <= 90
                                  ? "text-amber-600"
                                  : "text-gray-600"

                            return (
                              <>
                                <span className={`font-medium ${maintenanceAge}`}>
                                  Dernier entretien: {new Date(lastRecord.date).toLocaleDateString("fr-FR")}
                                  {daysSinceLastMaintenance <= 30 && " (récent)"}
                                </span>
                                <div className="flex flex-col text-xs text-gray-500 ml-6">
                                  <span className="truncate max-w-[200px]" title={lastRecord.type}>
                                    {lastRecord.type}
                                  </span>
                                  {lastRecord.mileageAtService && (
                                    <span>
                                      à {lastRecord.mileageAtService.toLocaleString()} km{" "}
                                      {vehicle.mileage - lastRecord.mileageAtService > 0
                                        ? `(${(vehicle.mileage - lastRecord.mileageAtService).toLocaleString()} km parcourus depuis)`
                                        : ""}
                                    </span>
                                  )}
                                </div>
                              </>
                            )
                          })()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center">
                      <span className="text-sm text-gray-600 mr-2">Visite technique:</span>
                      <Badge variant={inspectionStatus.color as any}>
                        {new Date(vehicle.nextTechnicalInspection).toLocaleDateString("fr-FR")} -{" "}
                        {inspectionStatus.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="ml-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm">
                          <MoreVertical className="h-4 w-4" />
                          Actions
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56">
                        {!isOutOfService ? (
                          <>
                            <DropdownMenuItem asChild>
                              <AddMaintenanceDialog
                                vehicle={vehicle}
                                garages={garages}
                                onAdd={onAddMaintenance}
                                interventionTypes={interventionTypes}
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <VehicleHistoryDialog
                                vehicle={vehicle}
                                garages={garages}
                                maintenanceRecords={maintenanceRecords}
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <UpdateTechnicalInspectionDialog vehicle={vehicle} onUpdate={onUpdateVehicle} />
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem asChild>
                              <EditVehicleDialog
                                vehicle={vehicle}
                                drivers={drivers.filter((d) => d.status === "active")}
                                onUpdate={onUpdateVehicle}
                              />
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <PlanMaintenanceDialog
                                vehicle={vehicle}
                                interventionTypes={interventionTypes}
                                maintenanceRecords={maintenanceRecords}
                                garages={garages}
                                onAddMaintenance={onAddMaintenance}
                              />
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem asChild>
                            <VehicleHistoryDialog
                              vehicle={vehicle}
                              garages={garages}
                              maintenanceRecords={maintenanceRecords}
                            />
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
