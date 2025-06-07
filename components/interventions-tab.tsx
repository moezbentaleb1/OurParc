"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { AlertTriangle, Calendar, Search, X, Clock, CheckCircle, Settings, FileText } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface InterventionsTabProps {
  vehicles: any[]
  drivers: any[]
  maintenanceRecords: any[]
  interventionTypes: any[]
}

export function InterventionsTab({ vehicles, drivers, maintenanceRecords, interventionTypes }: InterventionsTabProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedVehicle, setSelectedVehicle] = useState("all")

  const getDriverName = (driverId: number) => {
    const driver = drivers.find((d) => d.id === driverId)
    return driver ? driver.name : "Non assigné"
  }

  // Calculer les interventions dues pour chaque véhicule
  const calculateInterventions = useMemo(() => {
    const results = []

    vehicles.forEach((vehicle) => {
      if (vehicle.status === "out-of-service") return

      interventionTypes.forEach((intervention) => {
        // Trouver la dernière fois que cette intervention a été effectuée
        const lastIntervention = maintenanceRecords
          .filter(
            (record) =>
              record.vehicleId === vehicle.id &&
              record.type.toLowerCase().includes(intervention.description.toLowerCase().split(" ")[0]),
          )
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

        let isOverdue = false
        let daysUntilDue = null
        let kmUntilDue = null
        let status = "ok"

        // Vérifier l'échéance basée sur le kilométrage
        if (intervention.intervalKm) {
          const lastKm = lastIntervention?.mileageAtService || 0
          const kmSinceLastIntervention = vehicle.mileage - lastKm
          kmUntilDue = intervention.intervalKm - kmSinceLastIntervention

          if (kmUntilDue <= 0) {
            isOverdue = true
            status = "overdue"
          } else if (kmUntilDue <= intervention.intervalKm * 0.1) {
            // 10% de l'intervalle
            status = "due_soon"
          }
        }

        // Vérifier l'échéance basée sur le temps
        if (intervention.intervalTime) {
          const lastDate = lastIntervention ? new Date(lastIntervention.date) : new Date(vehicle.lastMaintenance)
          const nextDueDate = new Date(lastDate)
          nextDueDate.setMonth(nextDueDate.getMonth() + intervention.intervalTime)

          const today = new Date()
          daysUntilDue = Math.ceil((nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))

          if (daysUntilDue <= 0) {
            isOverdue = true
            status = "overdue"
          } else if (daysUntilDue <= 30) {
            // Dans les 30 prochains jours
            status = "due_soon"
          }
        }

        // Si les deux critères existent, prendre le plus restrictif
        if (intervention.intervalKm && intervention.intervalTime) {
          if (kmUntilDue <= 0 || daysUntilDue <= 0) {
            status = "overdue"
          } else if (kmUntilDue <= intervention.intervalKm * 0.1 || daysUntilDue <= 30) {
            status = "due_soon"
          }
        }

        results.push({
          vehicleId: vehicle.id,
          vehicleName: `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`,
          driverName: getDriverName(vehicle.driverId),
          intervention,
          lastIntervention,
          isOverdue,
          daysUntilDue,
          kmUntilDue,
          status,
          currentKm: vehicle.mileage,
        })
      })
    })

    return results
  }, [vehicles, maintenanceRecords, drivers, interventionTypes])

  // Filtrer les interventions
  const filteredInterventions = calculateInterventions.filter((item) => {
    if (selectedVehicle !== "all" && item.vehicleId !== Number.parseInt(selectedVehicle)) return false
    if (selectedCategory !== "all" && item.intervention.category !== selectedCategory) return false
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      return (
        item.intervention.description.toLowerCase().includes(searchLower) ||
        item.vehicleName.toLowerCase().includes(searchLower) ||
        item.driverName.toLowerCase().includes(searchLower)
      )
    }
    return true
  })

  // Séparer par statut
  const overdueInterventions = filteredInterventions.filter((item) => item.status === "overdue")
  const dueSoonInterventions = filteredInterventions.filter((item) => item.status === "due_soon")
  const upcomingInterventions = filteredInterventions.filter((item) => item.status === "ok")

  // Obtenir les catégories uniques
  const categories = [...new Set(interventionTypes.map((type) => type.category))].sort()

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

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En retard</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueInterventions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">À venir</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{dueSoonInterventions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Planifiées</CardTitle>
            <Calendar className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{upcomingInterventions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Types</CardTitle>
            <Settings className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{interventionTypes.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <FileText className="mr-2 h-5 w-5" />
            Interventions Préventives
          </CardTitle>
          <CardDescription>
            Suivi des interventions de maintenance préventive basées sur le kilométrage et la durée
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4 mb-6">
            {/* Recherche */}
            <div className="relative flex-1 min-w-64">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Rechercher une intervention, véhicule..."
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

            {/* Filtre par véhicule */}
            <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
              <SelectTrigger className="w-64">
                <SelectValue placeholder="Tous les véhicules" />
              </SelectTrigger>
              <SelectContent className="max-h-48 overflow-y-auto">
                <SelectItem value="all">Tous les véhicules</SelectItem>
                {vehicles
                  .filter((v) => v.status === "active")
                  .map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>

            {/* Filtre par catégorie */}
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

          {/* Onglets par statut */}
          <Tabs defaultValue="overdue" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overdue" className="flex items-center text-red-600">
                <AlertTriangle className="mr-2 h-4 w-4" />
                En retard ({overdueInterventions.length})
              </TabsTrigger>
              <TabsTrigger value="due_soon" className="flex items-center text-orange-600">
                <Clock className="mr-2 h-4 w-4" />À venir ({dueSoonInterventions.length})
              </TabsTrigger>
              <TabsTrigger value="upcoming" className="flex items-center text-green-600">
                <CheckCircle className="mr-2 h-4 w-4" />
                Planifiées ({upcomingInterventions.length})
              </TabsTrigger>
            </TabsList>

            {/* Interventions en retard */}
            <TabsContent value="overdue">
              <Card>
                <CardHeader>
                  <CardTitle className="text-red-600 flex items-center">
                    <AlertTriangle className="mr-2 h-5 w-5" />
                    Interventions en retard
                  </CardTitle>
                  <CardDescription>Ces interventions auraient dû être effectuées</CardDescription>
                </CardHeader>
                <CardContent>
                  {overdueInterventions.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white">
                          <TableRow>
                            <TableHead>Véhicule</TableHead>
                            <TableHead>Intervention</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Intervalle</TableHead>
                            <TableHead>Retard</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {overdueInterventions.map((item, index) => (
                            <TableRow key={index} className="bg-red-50">
                              <TableCell>
                                <div>
                                  <div className="font-medium">{item.vehicleName}</div>
                                  <div className="text-sm text-gray-500">{item.driverName}</div>
                                  <div className="text-xs text-gray-400">{item.currentKm.toLocaleString()} km</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs">
                                  <div className="font-medium text-sm">{item.intervention.description}</div>
                                  {item.lastIntervention && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Dernière: {new Date(item.lastIntervention.date).toLocaleDateString("fr-FR")}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.intervention.category}</Badge>
                              </TableCell>
                              <TableCell className="text-sm">{formatInterval(item.intervention)}</TableCell>
                              <TableCell className="text-sm text-red-600 font-medium">{formatNextDue(item)}</TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CheckCircle className="mx-auto h-12 w-12 text-green-300 mb-4" />
                      <p>Aucune intervention en retard</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interventions à venir */}
            <TabsContent value="due_soon">
              <Card>
                <CardHeader>
                  <CardTitle className="text-orange-600 flex items-center">
                    <Clock className="mr-2 h-5 w-5" />
                    Interventions à venir
                  </CardTitle>
                  <CardDescription>
                    Ces interventions sont dues dans les 30 prochains jours ou 10% du kilométrage
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dueSoonInterventions.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white">
                          <TableRow>
                            <TableHead>Véhicule</TableHead>
                            <TableHead>Intervention</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Intervalle</TableHead>
                            <TableHead>Échéance</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {dueSoonInterventions.map((item, index) => (
                            <TableRow key={index} className="bg-orange-50">
                              <TableCell>
                                <div>
                                  <div className="font-medium">{item.vehicleName}</div>
                                  <div className="text-sm text-gray-500">{item.driverName}</div>
                                  <div className="text-xs text-gray-400">{item.currentKm.toLocaleString()} km</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs">
                                  <div className="font-medium text-sm">{item.intervention.description}</div>
                                  {item.lastIntervention && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Dernière: {new Date(item.lastIntervention.date).toLocaleDateString("fr-FR")}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.intervention.category}</Badge>
                              </TableCell>
                              <TableCell className="text-sm">{formatInterval(item.intervention)}</TableCell>
                              <TableCell className="text-sm text-orange-600 font-medium">
                                {formatNextDue(item)}
                              </TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Calendar className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>Aucune intervention à venir prochainement</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Interventions planifiées */}
            <TabsContent value="upcoming">
              <Card>
                <CardHeader>
                  <CardTitle className="text-green-600 flex items-center">
                    <CheckCircle className="mr-2 h-5 w-5" />
                    Interventions planifiées
                  </CardTitle>
                  <CardDescription>Ces interventions sont programmées mais pas encore dues</CardDescription>
                </CardHeader>
                <CardContent>
                  {upcomingInterventions.length > 0 ? (
                    <div className="max-h-96 overflow-y-auto">
                      <Table>
                        <TableHeader className="sticky top-0 bg-white">
                          <TableRow>
                            <TableHead>Véhicule</TableHead>
                            <TableHead>Intervention</TableHead>
                            <TableHead>Catégorie</TableHead>
                            <TableHead>Intervalle</TableHead>
                            <TableHead>Prochaine échéance</TableHead>
                            <TableHead>Statut</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {upcomingInterventions.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{item.vehicleName}</div>
                                  <div className="text-sm text-gray-500">{item.driverName}</div>
                                  <div className="text-xs text-gray-400">{item.currentKm.toLocaleString()} km</div>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="max-w-xs">
                                  <div className="font-medium text-sm">{item.intervention.description}</div>
                                  {item.lastIntervention && (
                                    <div className="text-xs text-gray-500 mt-1">
                                      Dernière: {new Date(item.lastIntervention.date).toLocaleDateString("fr-FR")}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <Badge variant="outline">{item.intervention.category}</Badge>
                              </TableCell>
                              <TableCell className="text-sm">{formatInterval(item.intervention)}</TableCell>
                              <TableCell className="text-sm text-green-600">{formatNextDue(item)}</TableCell>
                              <TableCell>{getStatusBadge(item.status)}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <Settings className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                      <p>Aucune intervention planifiée</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
