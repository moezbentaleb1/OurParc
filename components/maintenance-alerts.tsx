"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertTriangle } from "lucide-react"

interface MaintenanceAlertsProps {
  alerts: any[]
  drivers: any[]
}

export function MaintenanceAlerts({ alerts, drivers }: MaintenanceAlertsProps) {
  const getDriverName = (driverId: number) => {
    const driver = drivers.find((d) => d.id === driverId)
    return driver ? driver.name : "Non assigné"
  }

  return (
    <Card className="mb-8 border-red-200">
      <CardHeader>
        <CardTitle className="flex items-center text-red-600">
          <AlertTriangle className="mr-2 h-5 w-5" />
          Alertes - Visites Techniques
        </CardTitle>
        <CardDescription>Véhicules nécessitant une visite technique dans les 30 prochains jours</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {alerts.map((vehicle) => {
            const inspectionDate = new Date(vehicle.nextTechnicalInspection)
            const currentDate = new Date()
            const daysDiff = Math.ceil((inspectionDate - currentDate) / (1000 * 60 * 60 * 24))

            return (
              <Alert key={vehicle.id} className="border-red-200">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>
                    {vehicle.brand} {vehicle.model}
                  </strong>{" "}
                  ({vehicle.licensePlate}) - Chauffeur: {getDriverName(vehicle.driverId)} - Visite technique dans{" "}
                  <strong>
                    {daysDiff} jour{daysDiff > 1 ? "s" : ""}
                  </strong>
                  ({inspectionDate.toLocaleDateString("fr-FR")})
                </AlertDescription>
              </Alert>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
