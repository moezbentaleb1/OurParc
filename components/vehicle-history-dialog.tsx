"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { History, Download, Calendar, Euro, Wrench, FileText } from "lucide-react"
import jsPDF from "jspdf"

interface VehicleHistoryDialogProps {
  vehicle: any
  garages: any[]
  maintenanceRecords: any[]
}

export function VehicleHistoryDialog({ vehicle, garages, maintenanceRecords }: VehicleHistoryDialogProps) {
  const [open, setOpen] = useState(false)

  // Filtrer les enregistrements pour ce véhicule
  const vehicleRecords = maintenanceRecords.filter((record) => record.vehicleId === vehicle.id)

  const getGarageName = (garageId: number) => {
    const garage = garages.find((g) => g.id === garageId)
    if (!garage) return "Garage inconnu"

    // Afficher la raison de suspension entre parenthèses si le garage est suspendu
    if (garage.status === "suspended" && garage.suspensionReason) {
      return `${garage.name} (${garage.suspensionReason})`
    }
    return garage.name
  }

  // Calculer les statistiques
  const totalCost = vehicleRecords.reduce((sum, record) => sum + record.cost, 0)
  const lastMaintenance =
    vehicleRecords.length > 0
      ? vehicleRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
      : null

  // Générer PDF pour ce véhicule spécifique
  const generateVehiclePDF = () => {
    const doc = new jsPDF()

    // Configuration
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 20
    let yPosition = margin

    // En-tête avec titre principal
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("HISTORIQUE D'ENTRETIEN", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    // Informations du véhicule
    doc.setFontSize(16)
    doc.setFont("helvetica", "bold")
    const vehicleTitle = `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})`
    doc.text(vehicleTitle, pageWidth / 2, yPosition, { align: "center" })
    yPosition += 20

    // Ligne de séparation
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 15

    // Informations générales du véhicule
    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")

    const vehicleInfo = [
      `Année: ${vehicle.year}`,
      `Kilométrage actuel: ${vehicle.mileage.toLocaleString()} km`,
      `Prochaine visite technique: ${new Date(vehicle.nextTechnicalInspection).toLocaleDateString("fr-FR")}`,
      `Date de génération: ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
    ]

    vehicleInfo.forEach((info) => {
      doc.text(info, margin, yPosition)
      yPosition += 8
    })

    yPosition += 10

    // Statistiques
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("STATISTIQUES", margin, yPosition)
    yPosition += 12

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    const stats = [
      `Nombre total d'entretiens: ${vehicleRecords.length}`,
      `Coût total des entretiens: ${totalCost.toFixed(2)} €`,
      `Coût moyen par entretien: ${vehicleRecords.length > 0 ? (totalCost / vehicleRecords.length).toFixed(2) : 0} €`,
      `Dernier entretien: ${lastMaintenance ? new Date(lastMaintenance.date).toLocaleDateString("fr-FR") : "Aucun"}`,
    ]

    stats.forEach((stat) => {
      doc.text(stat, margin, yPosition)
      yPosition += 8
    })

    yPosition += 15

    // Détail des entretiens
    if (vehicleRecords.length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("DÉTAIL DES ENTRETIENS", margin, yPosition)
      yPosition += 15

      // En-têtes du tableau
      doc.setFontSize(10)
      doc.setFont("helvetica", "bold")

      const headers = ["Date", "Type", "Garage", "Kilométrage", "Coût", "Description"]
      const colWidths = [25, 30, 35, 25, 20, 55]
      let xPosition = margin

      headers.forEach((header, index) => {
        doc.text(header, xPosition, yPosition)
        xPosition += colWidths[index]
      })

      yPosition += 5

      // Ligne sous les en-têtes
      doc.setLineWidth(0.3)
      doc.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 8

      // Données du tableau
      doc.setFont("helvetica", "normal")

      const sortedRecords = vehicleRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

      sortedRecords.forEach((record, index) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > pageHeight - 40) {
          doc.addPage()
          yPosition = margin
        }

        xPosition = margin

        const rowData = [
          new Date(record.date).toLocaleDateString("fr-FR"),
          record.type,
          getGarageName(record.garageId),
          record.mileageAtService ? `${record.mileageAtService.toLocaleString()} km` : "-",
          `${record.cost.toFixed(2)} €`,
          record.description.length > 30 ? record.description.substring(0, 30) + "..." : record.description,
        ]

        rowData.forEach((data, colIndex) => {
          doc.text(data, xPosition, yPosition)
          xPosition += colWidths[colIndex]
        })

        yPosition += 8

        // Ligne de séparation légère entre les entrées
        if (index < sortedRecords.length - 1) {
          doc.setLineWidth(0.1)
          doc.line(margin, yPosition + 2, pageWidth - margin, yPosition + 2)
          yPosition += 4
        }
      })
    } else {
      doc.setFontSize(12)
      doc.setFont("helvetica", "italic")
      doc.text("Aucun entretien enregistré pour ce véhicule.", margin, yPosition)
    }

    // Pied de page
    const footerY = pageHeight - 15
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text("Généré par OurParc - Système de gestion de parc automobile", pageWidth / 2, footerY, { align: "center" })

    // Télécharger le PDF
    const fileName = `historique-${vehicle.brand}-${vehicle.model}-${vehicle.licensePlate.replace(/[^a-zA-Z0-9]/g, "")}-${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="flex items-center w-full px-2 py-1.5 text-sm cursor-pointer hover:bg-gray-100 rounded">
          <History className="mr-2 h-4 w-4" />
          Voir l'historique
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="sticky top-0 bg-white z-10 pb-4 border-b">
          <DialogTitle className="flex items-center">
            <History className="mr-2 h-5 w-5" />
            Historique d'entretien - {vehicle.brand} {vehicle.model}
          </DialogTitle>
          <DialogDescription>
            Plaque: {vehicle.licensePlate} | Année: {vehicle.year} | Kilométrage: {vehicle.mileage.toLocaleString()} km
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 px-1 overflow-x-hidden">
          {/* Statistiques du véhicule */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Entretiens</CardTitle>
                <Wrench className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{vehicleRecords.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCost.toFixed(2)} €</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Coût Moyen</CardTitle>
                <Euro className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {vehicleRecords.length > 0 ? (totalCost / vehicleRecords.length).toFixed(2) : 0} €
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Dernier Entretien</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-sm font-bold">
                  {lastMaintenance ? new Date(lastMaintenance.date).toLocaleDateString("fr-FR") : "Aucun"}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bouton d'export */}
          <div className="flex justify-end sticky top-20 bg-white z-10 py-2">
            <Button onClick={generateVehiclePDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Télécharger l'historique
            </Button>
          </div>

          {/* Tableau des entretiens */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <FileText className="mr-2 h-4 w-4" />
                Détail des entretiens
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehicleRecords.length > 0 ? (
                <div className="max-h-96 overflow-y-auto border rounded">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Garage</TableHead>
                        <TableHead>Kilométrage</TableHead>
                        <TableHead>Coût</TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicleRecords
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((record) => (
                          <TableRow key={record.id}>
                            <TableCell className="font-medium">
                              {new Date(record.date).toLocaleDateString("fr-FR")}
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">{record.type}</Badge>
                            </TableCell>
                            <TableCell>{getGarageName(record.garageId)}</TableCell>
                            <TableCell>
                              {record.mileageAtService ? `${record.mileageAtService.toLocaleString()} km` : "-"}
                            </TableCell>
                            <TableCell className="font-medium">{record.cost.toFixed(2)} €</TableCell>
                            <TableCell className="max-w-xs">
                              <div className="truncate" title={record.description}>
                                {record.description}
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Wrench className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p>Aucun entretien enregistré pour ce véhicule</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Informations du véhicule */}
          <Card>
            <CardHeader>
              <CardTitle>Informations du véhicule</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Marque:</span> {vehicle.brand}
                </div>
                <div>
                  <span className="font-medium">Modèle:</span> {vehicle.model}
                </div>
                <div>
                  <span className="font-medium">Année:</span> {vehicle.year}
                </div>
                <div>
                  <span className="font-medium">Plaque:</span> {vehicle.licensePlate}
                </div>
                <div>
                  <span className="font-medium">Kilométrage:</span> {vehicle.mileage.toLocaleString()} km
                </div>
                <div>
                  <span className="font-medium">Prochaine visite technique:</span>{" "}
                  {new Date(vehicle.nextTechnicalInspection).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}
