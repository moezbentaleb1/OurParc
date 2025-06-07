"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { AlertTriangle, Car, Users, Wrench, Settings, FileText } from "lucide-react"
import { VehicleList } from "@/components/vehicle-list"
import { MaintenanceAlerts } from "@/components/maintenance-alerts"
import { AddVehicleDialog } from "@/components/add-vehicle-dialog"
import { AddDriverDialog } from "@/components/add-driver-dialog"
import { AddGarageDialog } from "@/components/add-garage-dialog"
import { MaintenanceHistory } from "@/components/maintenance-history"
import { ManagementTab } from "@/components/management-tab"
import { MaintenanceTypesTab } from "@/components/maintenance-types-tab"

export default function Dashboard() {
  const [vehicles, setVehicles] = useState([])
  const [drivers, setDrivers] = useState([])
  const [garages, setGarages] = useState([])
  const [maintenanceRecords, setMaintenanceRecords] = useState([])
  const [alerts, setAlerts] = useState([])
  const [interventionTypes, setInterventionTypes] = useState([])

  // Simuler le chargement des données
  useEffect(() => {
    // Données d'exemple
    const sampleVehicles = [
      {
        id: 1,
        brand: "Peugeot",
        model: "308",
        year: 2020,
        licensePlate: "AB-123-CD",
        driverId: 1,
        lastMaintenance: "2024-01-15",
        nextTechnicalInspection: "2024-12-15",
        mileage: 45000,
        status: "active", // "active" ou "out-of-service"
        outOfServiceDate: null, // Date de mise hors service
      },
      {
        id: 2,
        brand: "Renault",
        model: "Clio",
        year: 2019,
        licensePlate: "EF-456-GH",
        driverId: 2,
        lastMaintenance: "2024-02-10",
        nextTechnicalInspection: "2024-08-20",
        mileage: 52000,
        status: "active",
        outOfServiceDate: null,
      },
    ]

    const sampleDrivers = [
      {
        id: 1,
        name: "Jean Dupont",
        phone: "06.12.34.56.78",
        license: "B",
        status: "active", // "active" ou "out-of-service"
        outOfServiceDate: null,
      },
      {
        id: 2,
        name: "Marie Martin",
        phone: "06.87.65.43.21",
        license: "B",
        status: "active",
        outOfServiceDate: null,
      },
    ]

    const sampleGarages = [
      {
        id: 1,
        name: "Garage Central",
        address: "123 Rue de la Paix, Paris",
        phone: "01.23.45.67.89",
        status: "active", // "active" ou "suspended"
        suspensionDate: null,
        suspensionReason: null,
      },
      {
        id: 2,
        name: "Auto Service Plus",
        address: "456 Avenue des Champs, Lyon",
        phone: "04.56.78.90.12",
        status: "active",
        suspensionDate: null,
        suspensionReason: null,
      },
    ]

    const sampleMaintenance = [
      {
        id: 1,
        vehicleId: 1,
        garageId: 1,
        date: "2024-01-15",
        type: "Révision générale",
        cost: 250,
        description: "Changement huile, filtres, contrôle freins",
        mileageAtService: 42000,
      },
      {
        id: 2,
        vehicleId: 2,
        garageId: 2,
        date: "2024-02-10",
        type: "Réparation",
        cost: 180,
        description: "Remplacement plaquettes de frein",
        mileageAtService: 50000,
      },
      {
        id: 3,
        vehicleId: 1,
        garageId: 1,
        date: "2023-08-20",
        type: "Vidange",
        cost: 85,
        description: "Vidange moteur et changement filtre à huile",
        mileageAtService: 38000,
      },
    ]

    const sampleInterventionTypes = [
      {
        id: 1,
        description: "CHARGE CLIM PM =< A 550 GR+ FILTRE HABITACLE",
        intervalTime: 12,
        intervalKm: null,
        category: "Climatisation",
      },
      {
        id: 2,
        description: "AMORTISSEURS AR - LA PAIRE",
        intervalTime: null,
        intervalKm: 100000,
        category: "Suspension",
      },
      {
        id: 3,
        description: "AMORTISSEURS AV-LA PAIRE -BIELLETTE DE SUSPENSION",
        intervalTime: null,
        intervalKm: 50000,
        category: "Suspension",
      },
      {
        id: 4,
        description: "BOUGIES ALLUMAGE",
        intervalTime: null,
        intervalKm: 30000,
        category: "Moteur",
      },
      {
        id: 5,
        description: "BOUGIES ALLUMAGE LASER",
        intervalTime: null,
        intervalKm: 60000,
        category: "Moteur",
      },
      {
        id: 6,
        description: "BOUGIES DE PRECHAUFFAGE",
        intervalTime: null,
        intervalKm: 80000,
        category: "Moteur",
      },
      {
        id: 7,
        description: "KIT D'EMBRAYAGE -CABLE EMBRAYAGE-VIDANGE BOITE",
        intervalTime: null,
        intervalKm: 100000,
        category: "Transmission",
      },
      {
        id: 8,
        description: "MO COURROIE ACCESSOIRE",
        intervalTime: null,
        intervalKm: 60000,
        category: "Moteur",
      },
      {
        id: 9,
        description: "MO DISQUES DE FREIN - LA PAIRE",
        intervalTime: null,
        intervalKm: 70000,
        category: "Freinage",
      },
      {
        id: 10,
        description: "MO FILTRE HABITACLE DEF1",
        intervalTime: 6,
        intervalKm: null,
        category: "Filtration",
      },
      {
        id: 11,
        description: "MO MACHOIRES - LA PAIRE-REGLAGE DE FREIN A MAIN",
        intervalTime: null,
        intervalKm: 100000,
        category: "Freinage",
      },
      {
        id: 12,
        description: "MO PLAQUETTE AR-LA PAIRE",
        intervalTime: null,
        intervalKm: 50000,
        category: "Freinage",
      },
      {
        id: 13,
        description: "MO PLAQUETTE AV -LA PAIRE",
        intervalTime: null,
        intervalKm: 30000,
        category: "Freinage",
      },
      {
        id: 14,
        description: "MO POMPE A EAU",
        intervalTime: null,
        intervalKm: 60000,
        category: "Refroidissement",
      },
      {
        id: 15,
        description: "PIVOTATION PNEUS",
        intervalTime: null,
        intervalKm: 30000,
        category: "Pneumatiques",
      },
      {
        id: 16,
        description: "CHANGEMENT DES PNEUS",
        intervalTime: 48,
        intervalKm: 60000,
        category: "Pneumatiques",
      },
      {
        id: 17,
        description: "DISTRIBUTION+POMPE A EAU",
        intervalTime: null,
        intervalKm: 60000,
        category: "Moteur",
      },
      {
        id: 18,
        description: "CHANGEMENT HUILE DE FREIN",
        intervalTime: null,
        intervalKm: 80000,
        category: "Freinage",
      },
      {
        id: 19,
        description: "ADITIF NETT CIRCUIT ADMISSION",
        intervalTime: null,
        intervalKm: 40000,
        category: "Moteur",
      },
      {
        id: 20,
        description: "RINÇAGE CIRCUIT DE REFROIDISSEMENT",
        intervalTime: 12,
        intervalKm: null,
        category: "Refroidissement",
      },
      {
        id: 21,
        description: "VIDANGE BOITE MANUEL",
        intervalTime: null,
        intervalKm: 80000,
        category: "Transmission",
      },
      {
        id: 22,
        description: "VIDANGE BOITE AUTOMATIQUE",
        intervalTime: null,
        intervalKm: 100000,
        category: "Transmission",
      },
      {
        id: 23,
        description: "MO VIDANGE MOTEUR+FILTRE A HUILE + FILTRE A AIR",
        intervalTime: 12,
        intervalKm: 10000,
        category: "Moteur",
      },
      {
        id: 24,
        description: "MO VIDANGE PONT",
        intervalTime: null,
        intervalKm: 80000,
        category: "Transmission",
      },
      {
        id: 25,
        description: "MO NETTOYAGE CIRCUIT EGR",
        intervalTime: null,
        intervalKm: 50000,
        category: "Moteur",
      },
      {
        id: 26,
        description: "ADITIF NETTOYAGE CIRCUIT CARBURANT",
        intervalTime: null,
        intervalKm: 50000,
        category: "Carburant",
      },
      {
        id: 27,
        description: "FILTRE GASOIL",
        intervalTime: null,
        intervalKm: 30000,
        category: "Filtration",
      },
      {
        id: 28,
        description: "COURROIE ET TENDEUR ACCESSOIRE",
        intervalTime: null,
        intervalKm: 60000,
        category: "Moteur",
      },
      {
        id: 29,
        description: "MO POMPE A EAU (DISTRIBUTION)",
        intervalTime: null,
        intervalKm: 60000,
        category: "Refroidissement",
      },
      {
        id: 30,
        description: "MO KIT CHAINE DE DISTRIBUTION (ACIER)",
        intervalTime: null,
        intervalKm: 120000,
        category: "Moteur",
      },
    ]

    setInterventionTypes(sampleInterventionTypes)

    setVehicles(sampleVehicles)
    setDrivers(sampleDrivers)
    setGarages(sampleGarages)
    setMaintenanceRecords(sampleMaintenance)
    setInterventionTypes(sampleInterventionTypes)

    // Générer les alertes
    const currentDate = new Date()
    const vehicleAlerts = sampleVehicles.filter((vehicle) => {
      const inspectionDate = new Date(vehicle.nextTechnicalInspection)
      const daysDiff = Math.ceil((inspectionDate - currentDate) / (1000 * 60 * 60 * 24))
      return daysDiff <= 30 && daysDiff >= 0 && vehicle.status === "active"
    })
    setAlerts(vehicleAlerts)
  }, [])

  const addVehicle = (vehicle) => {
    const newVehicle = { ...vehicle, id: Date.now() }
    setVehicles([...vehicles, newVehicle])
  }

  const addDriver = (driver) => {
    const newDriver = {
      ...driver,
      id: Date.now(),
      status: "active",
      outOfServiceDate: null,
    }
    setDrivers([...drivers, newDriver])
  }

  const addGarage = (garage) => {
    const newGarage = {
      ...garage,
      id: Date.now(),
      status: "active",
      suspensionDate: null,
      suspensionReason: null,
    }
    setGarages([...garages, newGarage])
  }

  const addMaintenanceRecord = (record) => {
    const newRecord = { ...record, id: Date.now() }
    setMaintenanceRecords([...maintenanceRecords, newRecord])

    // Mettre à jour le kilométrage du véhicule si celui de l'entretien est plus élevé
    if (record.mileageAtService) {
      const vehicle = vehicles.find((v) => v.id === record.vehicleId)
      if (vehicle && record.mileageAtService > vehicle.mileage) {
        updateVehicle(record.vehicleId, {
          mileage: record.mileageAtService,
          lastMaintenance: record.date,
        })
      } else if (vehicle) {
        // Mettre à jour uniquement la date du dernier entretien
        updateVehicle(record.vehicleId, { lastMaintenance: record.date })
      }
    }
  }

  const updateVehicle = (vehicleId: number, updates: any) => {
    setVehicles(vehicles.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, ...updates } : vehicle)))

    // Recalculer les alertes après mise à jour
    const updatedVehicles = vehicles.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, ...updates } : vehicle))

    const currentDate = new Date()
    const vehicleAlerts = updatedVehicles.filter((vehicle) => {
      const inspectionDate = new Date(vehicle.nextTechnicalInspection)
      const daysDiff = Math.ceil((inspectionDate - currentDate) / (1000 * 60 * 60 * 24))
      return daysDiff <= 30 && daysDiff >= 0 && vehicle.status === "active"
    })
    setAlerts(vehicleAlerts)
  }

  const updateVehicleStatus = (vehicleId: number, status: "active" | "out-of-service", outOfServiceDate?: string) => {
    const updates = { status, outOfServiceDate: status === "out-of-service" ? outOfServiceDate : null }
    setVehicles(vehicles.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, ...updates } : vehicle)))

    // Recalculer les alertes (exclure les véhicules hors service)
    const updatedVehicles = vehicles.map((vehicle) => (vehicle.id === vehicleId ? { ...vehicle, ...updates } : vehicle))
    const activeVehicles = updatedVehicles.filter((vehicle) => vehicle.status === "active")

    const currentDate = new Date()
    const vehicleAlerts = activeVehicles.filter((vehicle) => {
      const inspectionDate = new Date(vehicle.nextTechnicalInspection)
      const daysDiff = Math.ceil((inspectionDate - currentDate) / (1000 * 60 * 60 * 24))
      return daysDiff <= 30 && daysDiff >= 0
    })
    setAlerts(vehicleAlerts)
  }

  const updateDriverStatus = (driverId: number, status: "active" | "out-of-service", outOfServiceDate?: string) => {
    const updates = { status, outOfServiceDate: status === "out-of-service" ? outOfServiceDate : null }
    setDrivers(drivers.map((driver) => (driver.id === driverId ? { ...driver, ...updates } : driver)))

    // Si le chauffeur est mis hors service, désassigner tous ses véhicules
    if (status === "out-of-service") {
      setVehicles(vehicles.map((vehicle) => (vehicle.driverId === driverId ? { ...vehicle, driverId: null } : vehicle)))
    }
  }

  const updateGarageStatus = (
    garageId: number,
    status: "active" | "suspended",
    suspensionDate?: string,
    suspensionReason?: string,
  ) => {
    const updates = {
      status,
      suspensionDate: status === "suspended" ? suspensionDate : null,
      suspensionReason: status === "suspended" ? suspensionReason : null,
    }
    setGarages(garages.map((garage) => (garage.id === garageId ? { ...garage, ...updates } : garage)))
  }

  const addInterventionType = (type) => {
    const newType = { ...type, id: Date.now() }
    setInterventionTypes([...interventionTypes, newType])
  }

  const updateInterventionType = (typeId, updates) => {
    setInterventionTypes(interventionTypes.map((type) => (type.id === typeId ? { ...type, ...updates } : type)))
  }

  const deleteInterventionType = (typeId) => {
    setInterventionTypes(interventionTypes.filter((type) => type.id !== typeId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Car className="h-8 w-8 text-blue-600 mr-3" />
              <h1 className="text-3xl font-bold text-gray-900">OurParc</h1>
            </div>
            <div className="flex space-x-4">
              <AddVehicleDialog onAdd={addVehicle} drivers={drivers.filter((d) => d.status === "active")} />
              <AddDriverDialog onAdd={addDriver} />
              <AddGarageDialog onAdd={addGarage} />
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Véhicules</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{vehicles.filter((v) => v.status === "active").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Chauffeurs</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{drivers.filter((d) => d.status === "active").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Garages</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{garages.filter((g) => g.status === "active").length}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alertes</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{alerts.length}</div>
            </CardContent>
          </Card>
        </div>

        {/* Alertes */}
        {alerts.length > 0 && <MaintenanceAlerts alerts={alerts} drivers={drivers} />}

        {/* Onglets principaux */}
        <Tabs defaultValue="vehicles" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="vehicles" className="flex items-center">
              <Car className="mr-2 h-4 w-4" />
              Parc Automobile
            </TabsTrigger>
            <TabsTrigger value="types" className="flex items-center">
              <Wrench className="mr-2 h-4 w-4" />
              Types d'entretien
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center">
              <FileText className="mr-2 h-4 w-4" />
              Historique
            </TabsTrigger>
            <TabsTrigger value="management" className="flex items-center">
              <Settings className="mr-2 h-4 w-4" />
              Gestion
            </TabsTrigger>
          </TabsList>

          <TabsContent value="vehicles">
            <VehicleList
              vehicles={vehicles}
              drivers={drivers}
              onAddMaintenance={addMaintenanceRecord}
              garages={garages}
              maintenanceRecords={maintenanceRecords}
              onUpdateVehicle={updateVehicle}
              interventionTypes={interventionTypes}
            />
          </TabsContent>

          <TabsContent value="types">
            <MaintenanceTypesTab
              interventionTypes={interventionTypes}
              onAddType={addInterventionType}
              onUpdateType={updateInterventionType}
              onDeleteType={deleteInterventionType}
            />
          </TabsContent>

          <TabsContent value="history">
            <MaintenanceHistory records={maintenanceRecords} vehicles={vehicles} garages={garages} />
          </TabsContent>

          <TabsContent value="management">
            <ManagementTab
              vehicles={vehicles}
              drivers={drivers}
              garages={garages}
              maintenanceRecords={maintenanceRecords}
              onUpdateVehicleStatus={updateVehicleStatus}
              onUpdateDriverStatus={updateDriverStatus}
              onUpdateGarageStatus={updateGarageStatus}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
