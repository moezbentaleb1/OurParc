"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Car, Users, Wrench, Search, X, AlertTriangle, Calendar, CheckCircle, XCircle } from "lucide-react"

interface ManagementTabProps {
  vehicles: any[]
  drivers: any[]
  garages: any[]
  maintenanceRecords: any[]
  onUpdateVehicleStatus: (vehicleId: number, status: "active" | "out-of-service", outOfServiceDate?: string) => void
  onUpdateDriverStatus: (driverId: number, status: "active" | "out-of-service", outOfServiceDate?: string) => void
  onUpdateGarageStatus: (
    garageId: number,
    status: "active" | "suspended",
    suspensionDate?: string,
    suspensionReason?: string,
  ) => void
}

export function ManagementTab({
  vehicles,
  drivers,
  garages,
  maintenanceRecords,
  onUpdateVehicleStatus,
  onUpdateDriverStatus,
  onUpdateGarageStatus,
}: ManagementTabProps) {
  const [vehicleSearch, setVehicleSearch] = useState("")
  const [driverSearch, setDriverSearch] = useState("")
  const [garageSearch, setGarageSearch] = useState("")
  const [outOfServiceDialogOpen, setOutOfServiceDialogOpen] = useState(false)
  const [driverOutOfServiceDialogOpen, setDriverOutOfServiceDialogOpen] = useState(false)
  const [garageSuspensionDialogOpen, setGarageSuspensionDialogOpen] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState(null)
  const [selectedDriver, setSelectedDriver] = useState(null)
  const [selectedGarage, setSelectedGarage] = useState(null)
  const [outOfServiceDate, setOutOfServiceDate] = useState("")
  const [driverOutOfServiceDate, setDriverOutOfServiceDate] = useState("")
  const [garageSuspensionDate, setGarageSuspensionDate] = useState("")
  const [garageSuspensionReason, setGarageSuspensionReason] = useState("")

  // Fonctions utilitaires
  const getDriverName = (driverId: number) => {
    const driver = drivers.find((d) => d.id === driverId)
    return driver ? driver.name : "Non assigné"
  }

  const getVehicleMaintenanceCount = (vehicleId: number) => {
    return maintenanceRecords.filter((record) => record.vehicleId === vehicleId).length
  }

  const getDriverVehicleCount = (driverId: number) => {
    return vehicles.filter((vehicle) => vehicle.driverId === driverId).length
  }

  const getGarageMaintenanceCount = (garageId: number) => {
    return maintenanceRecords.filter((record) => record.garageId === garageId).length
  }

  // Gestion du changement de statut véhicule
  const handleVehicleStatusChange = (vehicle: any, status: "active" | "out-of-service") => {
    if (status === "out-of-service") {
      setSelectedVehicle(vehicle)
      setOutOfServiceDate(new Date().toISOString().split("T")[0])
      setOutOfServiceDialogOpen(true)
    } else {
      onUpdateVehicleStatus(vehicle.id, status)
    }
  }

  const handleVehicleOutOfServiceConfirm = () => {
    if (selectedVehicle && outOfServiceDate) {
      onUpdateVehicleStatus(selectedVehicle.id, "out-of-service", outOfServiceDate)
      setOutOfServiceDialogOpen(false)
      setSelectedVehicle(null)
      setOutOfServiceDate("")
    }
  }

  // Gestion du changement de statut chauffeur
  const handleDriverStatusChange = (driver: any, status: "active" | "out-of-service") => {
    if (status === "out-of-service") {
      setSelectedDriver(driver)
      setDriverOutOfServiceDate(new Date().toISOString().split("T")[0])
      setDriverOutOfServiceDialogOpen(true)
    } else {
      onUpdateDriverStatus(driver.id, status)
    }
  }

  const handleDriverOutOfServiceConfirm = () => {
    if (selectedDriver && driverOutOfServiceDate) {
      onUpdateDriverStatus(selectedDriver.id, "out-of-service", driverOutOfServiceDate)
      setDriverOutOfServiceDialogOpen(false)
      setSelectedDriver(null)
      setDriverOutOfServiceDate("")
    }
  }

  // Gestion du changement de statut garage
  const handleGarageStatusChange = (garage: any, status: "active" | "suspended") => {
    if (status === "suspended") {
      setSelectedGarage(garage)
      setGarageSuspensionDate(new Date().toISOString().split("T")[0])
      setGarageSuspensionReason("")
      setGarageSuspensionDialogOpen(true)
    } else {
      onUpdateGarageStatus(garage.id, status)
    }
  }

  const handleGarageSuspensionConfirm = () => {
    if (selectedGarage && garageSuspensionDate && garageSuspensionReason) {
      onUpdateGarageStatus(selectedGarage.id, "suspended", garageSuspensionDate, garageSuspensionReason)
      setGarageSuspensionDialogOpen(false)
      setSelectedGarage(null)
      setGarageSuspensionDate("")
      setGarageSuspensionReason("")
    }
  }

  // Filtrage
  const filteredVehicles = vehicles.filter((vehicle) => {
    if (!vehicleSearch) return true
    const searchLower = vehicleSearch.toLowerCase()
    const driverName = getDriverName(vehicle.driverId).toLowerCase()
    return (
      vehicle.brand.toLowerCase().includes(searchLower) ||
      vehicle.model.toLowerCase().includes(searchLower) ||
      vehicle.licensePlate.toLowerCase().includes(searchLower) ||
      driverName.includes(searchLower)
    )
  })

  const filteredDrivers = drivers.filter((driver) => {
    if (!driverSearch) return true
    const searchLower = driverSearch.toLowerCase()
    return driver.name.toLowerCase().includes(searchLower) || driver.phone.includes(driverSearch)
  })

  const filteredGarages = garages.filter((garage) => {
    if (!garageSearch) return true
    const searchLower = garageSearch.toLowerCase()
    return garage.name.toLowerCase().includes(searchLower) || garage.address.toLowerCase().includes(searchLower)
  })

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-red-600">
            <AlertTriangle className="mr-2 h-5 w-5" />
            Zone de Gestion - Statuts
          </CardTitle>
          <CardDescription>
            Gérez le statut des véhicules, chauffeurs et garages. Les éléments désactivés restent visibles dans
            l'historique.
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="vehicles" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="vehicles" className="flex items-center">
            <Car className="mr-2 h-4 w-4" />
            Véhicules ({vehicles.length})
          </TabsTrigger>
          <TabsTrigger value="drivers" className="flex items-center">
            <Users className="mr-2 h-4 w-4" />
            Chauffeurs ({drivers.length})
          </TabsTrigger>
          <TabsTrigger value="garages" className="flex items-center">
            <Wrench className="mr-2 h-4 w-4" />
            Garages ({garages.length})
          </TabsTrigger>
        </TabsList>

        {/* Gestion des véhicules */}
        <TabsContent value="vehicles">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestion du Statut des Véhicules</CardTitle>
                  <CardDescription>
                    Marquer les véhicules comme hors service (désactive les modifications)
                  </CardDescription>
                </div>
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un véhicule..."
                    value={vehicleSearch}
                    onChange={(e) => setVehicleSearch(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {vehicleSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setVehicleSearch("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {filteredVehicles.map((vehicle) => {
                  const maintenanceCount = getVehicleMaintenanceCount(vehicle.id)
                  const isOutOfService = vehicle.status === "out-of-service"

                  return (
                    <div
                      key={vehicle.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${isOutOfService ? "bg-orange-50 border-orange-200" : ""}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">
                            {vehicle.brand} {vehicle.model} ({vehicle.year})
                            {isOutOfService && <span className="text-orange-600 ml-2">(Hors Service)</span>}
                          </h3>
                          <Badge variant="outline">{vehicle.licensePlate}</Badge>
                          {isOutOfService && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Hors Service
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          Chauffeur: {getDriverName(vehicle.driverId)} | {maintenanceCount} entretien
                          {maintenanceCount !== 1 ? "s" : ""} | {vehicle.mileage.toLocaleString()} km
                        </div>
                        {isOutOfService && vehicle.outOfServiceDate && (
                          <div className="text-xs text-orange-600 mt-1 font-medium flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            Hors service depuis le {new Date(vehicle.outOfServiceDate).toLocaleDateString("fr-FR")}
                          </div>
                        )}
                        {isOutOfService && (
                          <div className="text-xs text-orange-600 mt-1 font-medium">
                            ⚠️ Véhicule hors service - Modifications désactivées
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium">Statut:</label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={!isOutOfService ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleVehicleStatusChange(vehicle, "active")}
                              className={`flex items-center space-x-2 ${
                                !isOutOfService
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "border-green-300 text-green-700 hover:bg-green-50"
                              }`}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>En Service</span>
                            </Button>
                            <Button
                              variant={isOutOfService ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleVehicleStatusChange(vehicle, "out-of-service")}
                              className={`flex items-center space-x-2 ${
                                isOutOfService
                                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                                  : "border-orange-300 text-orange-700 hover:bg-orange-50"
                              }`}
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Hors Service</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredVehicles.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {vehicleSearch ? "Aucun véhicule trouvé" : "Aucun véhicule à gérer"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des chauffeurs */}
        <TabsContent value="drivers">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestion des Chauffeurs</CardTitle>
                  <CardDescription>
                    Gérer le statut des chauffeurs (les véhicules seront désassignés si hors service)
                  </CardDescription>
                </div>
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un chauffeur..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {driverSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDriverSearch("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {filteredDrivers.map((driver) => {
                  const vehicleCount = getDriverVehicleCount(driver.id)
                  const isOutOfService = driver.status === "out-of-service"

                  return (
                    <div
                      key={driver.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${isOutOfService ? "bg-orange-50 border-orange-200" : ""}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">
                            {driver.name}
                            {isOutOfService && <span className="text-orange-600 ml-2">(Hors Service)</span>}
                          </h3>
                          <Badge variant="outline">Permis {driver.license}</Badge>
                          {isOutOfService && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Hors Service
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {driver.phone} | {vehicleCount} véhicule{vehicleCount !== 1 ? "s" : ""} assigné
                          {vehicleCount !== 1 ? "s" : ""}
                        </div>
                        {isOutOfService && driver.outOfServiceDate && (
                          <div className="text-xs text-orange-600 mt-1 font-medium flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            Hors service depuis le {new Date(driver.outOfServiceDate).toLocaleDateString("fr-FR")}
                          </div>
                        )}
                        {isOutOfService && (
                          <div className="text-xs text-orange-600 mt-1 font-medium">
                            ⚠️ Chauffeur hors service - Ne peut pas être assigné à un véhicule
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium">Statut:</label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={!isOutOfService ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleDriverStatusChange(driver, "active")}
                              className={`flex items-center space-x-2 ${
                                !isOutOfService
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "border-green-300 text-green-700 hover:bg-green-50"
                              }`}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Actif</span>
                            </Button>
                            <Button
                              variant={isOutOfService ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleDriverStatusChange(driver, "out-of-service")}
                              className={`flex items-center space-x-2 ${
                                isOutOfService
                                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                                  : "border-orange-300 text-orange-700 hover:bg-orange-50"
                              }`}
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Hors Service</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredDrivers.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {driverSearch ? "Aucun chauffeur trouvé" : "Aucun chauffeur à gérer"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des garages */}
        <TabsContent value="garages">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>Gestion des Garages</CardTitle>
                  <CardDescription>Gérer le statut des garages partenaires</CardDescription>
                </div>
                <div className="relative w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Rechercher un garage..."
                    value={garageSearch}
                    onChange={(e) => setGarageSearch(e.target.value)}
                    className="pl-10 pr-10"
                  />
                  {garageSearch && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setGarageSearch("")}
                      className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                {filteredGarages.map((garage) => {
                  const maintenanceCount = getGarageMaintenanceCount(garage.id)
                  const isSuspended = garage.status === "suspended"

                  return (
                    <div
                      key={garage.id}
                      className={`flex items-center justify-between p-4 border rounded-lg ${isSuspended ? "bg-orange-50 border-orange-200" : ""}`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <h3 className="font-semibold">
                            {garage.name}
                            {isSuspended && garage.suspensionReason && (
                              <span className="text-orange-600 ml-2">({garage.suspensionReason})</span>
                            )}
                          </h3>
                          {isSuspended && (
                            <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                              Suspendu
                            </Badge>
                          )}
                        </div>
                        <div className="text-sm text-gray-600 mt-1">
                          {garage.address} | {garage.phone} | {maintenanceCount} entretien
                          {maintenanceCount !== 1 ? "s" : ""} effectué{maintenanceCount !== 1 ? "s" : ""}
                        </div>
                        {isSuspended && garage.suspensionDate && (
                          <div className="text-xs text-orange-600 mt-1 font-medium flex items-center">
                            <Calendar className="mr-1 h-3 w-3" />
                            Suspendu depuis le {new Date(garage.suspensionDate).toLocaleDateString("fr-FR")}
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <label className="text-sm font-medium">Statut:</label>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant={!isSuspended ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleGarageStatusChange(garage, "active")}
                              className={`flex items-center space-x-2 ${
                                !isSuspended
                                  ? "bg-green-600 hover:bg-green-700 text-white"
                                  : "border-green-300 text-green-700 hover:bg-green-50"
                              }`}
                            >
                              <CheckCircle className="h-4 w-4" />
                              <span>Actif</span>
                            </Button>
                            <Button
                              variant={isSuspended ? "default" : "outline"}
                              size="sm"
                              onClick={() => handleGarageStatusChange(garage, "suspended")}
                              className={`flex items-center space-x-2 ${
                                isSuspended
                                  ? "bg-orange-600 hover:bg-orange-700 text-white"
                                  : "border-orange-300 text-orange-700 hover:bg-orange-50"
                              }`}
                            >
                              <XCircle className="h-4 w-4" />
                              <span>Suspendu</span>
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
                {filteredGarages.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    {garageSearch ? "Aucun garage trouvé" : "Aucun garage à gérer"}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Dialog pour la date de mise hors service véhicule */}
      <Dialog open={outOfServiceDialogOpen} onOpenChange={setOutOfServiceDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <DialogTitle className="flex items-center">
              <XCircle className="mr-2 h-5 w-5 text-orange-600" />
              Marquer le véhicule comme hors service
            </DialogTitle>
            <DialogDescription>
              {selectedVehicle && (
                <>
                  Véhicule: {selectedVehicle.brand} {selectedVehicle.model} ({selectedVehicle.licensePlate})
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 px-1">
            <div>
              <Label htmlFor="outOfServiceDate">Date de mise hors service</Label>
              <Input
                id="outOfServiceDate"
                type="date"
                value={outOfServiceDate}
                onChange={(e) => setOutOfServiceDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
              <div className="text-xs text-gray-500 mt-1">La date ne peut pas être dans le futur</div>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center text-orange-800 text-sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span className="font-medium">Attention :</span>
              </div>
              <div className="mt-1 text-sm text-orange-700">
                Une fois marqué comme hors service, toutes les modifications seront désactivées (entretiens, visite
                technique, etc.)
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setOutOfServiceDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleVehicleOutOfServiceConfirm}
              disabled={!outOfServiceDate}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Confirmer la mise hors service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour la date de mise hors service chauffeur */}
      <Dialog open={driverOutOfServiceDialogOpen} onOpenChange={setDriverOutOfServiceDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <DialogTitle className="flex items-center">
              <XCircle className="mr-2 h-5 w-5 text-orange-600" />
              Marquer le chauffeur comme hors service
            </DialogTitle>
            <DialogDescription>{selectedDriver && <>Chauffeur: {selectedDriver.name}</>}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 px-1">
            <div>
              <Label htmlFor="driverOutOfServiceDate">Date de mise hors service</Label>
              <Input
                id="driverOutOfServiceDate"
                type="date"
                value={driverOutOfServiceDate}
                onChange={(e) => setDriverOutOfServiceDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
              <div className="text-xs text-gray-500 mt-1">La date ne peut pas être dans le futur</div>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center text-orange-800 text-sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span className="font-medium">Attention :</span>
              </div>
              <div className="mt-1 text-sm text-orange-700">
                Une fois marqué comme hors service, le chauffeur ne pourra plus être assigné à un véhicule et tous ses
                véhicules actuels seront désassignés.
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setDriverOutOfServiceDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleDriverOutOfServiceConfirm}
              disabled={!driverOutOfServiceDate}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Confirmer la mise hors service
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog pour la suspension d'un garage */}
      <Dialog open={garageSuspensionDialogOpen} onOpenChange={setGarageSuspensionDialogOpen}>
        <DialogContent className="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
          <DialogHeader className="sticky top-0 bg-white z-10 pb-4">
            <DialogTitle className="flex items-center">
              <XCircle className="mr-2 h-5 w-5 text-orange-600" />
              Suspendre le garage
            </DialogTitle>
            <DialogDescription>{selectedGarage && <>Garage: {selectedGarage.name}</>}</DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4 px-1">
            <div>
              <Label htmlFor="garageSuspensionDate">Date de suspension</Label>
              <Input
                id="garageSuspensionDate"
                type="date"
                value={garageSuspensionDate}
                onChange={(e) => setGarageSuspensionDate(e.target.value)}
                max={new Date().toISOString().split("T")[0]}
                required
              />
              <div className="text-xs text-gray-500 mt-1">La date ne peut pas être dans le futur</div>
            </div>

            <div>
              <Label htmlFor="garageSuspensionReason">Raison de la suspension</Label>
              <Textarea
                id="garageSuspensionReason"
                value={garageSuspensionReason}
                onChange={(e) => setGarageSuspensionReason(e.target.value)}
                placeholder="Exemple: Qualité insuffisante, Fermeture temporaire, etc."
                className="min-h-[80px] max-h-32 resize-none"
                required
              />
              <div className="text-xs text-gray-500 mt-1">
                Cette raison sera affichée entre parenthèses à côté du nom du garage
              </div>
            </div>

            <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center text-orange-800 text-sm">
                <AlertTriangle className="mr-2 h-4 w-4" />
                <span className="font-medium">Attention :</span>
              </div>
              <div className="mt-1 text-sm text-orange-700">
                Un garage suspendu restera visible dans l'historique des entretiens mais ne pourra plus être sélectionné
                pour de nouveaux entretiens.
              </div>
            </div>
          </div>

          <DialogFooter className="sticky bottom-0 bg-white pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => setGarageSuspensionDialogOpen(false)}>
              Annuler
            </Button>
            <Button
              type="button"
              onClick={handleGarageSuspensionConfirm}
              disabled={!garageSuspensionDate || !garageSuspensionReason}
              className="bg-orange-600 hover:bg-orange-700"
            >
              Confirmer la suspension
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
