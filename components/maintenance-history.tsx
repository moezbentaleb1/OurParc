"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { FileText, Download, Search, X, Filter, Calendar, Euro, Car, Wrench, SortAsc, SortDesc } from "lucide-react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import jsPDF from "jspdf"

interface MaintenanceHistoryProps {
  records: any[]
  vehicles: any[]
  garages: any[]
}

export function MaintenanceHistory({ records, vehicles, garages }: MaintenanceHistoryProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedVehicle, setSelectedVehicle] = useState("all")
  const [selectedGarage, setSelectedGarage] = useState("all")
  const [selectedType, setSelectedType] = useState("all")
  const [dateRange, setDateRange] = useState("all")
  const [sortBy, setSortBy] = useState("date")
  const [sortOrder, setSortOrder] = useState("desc")
  const [viewMode, setViewMode] = useState("table") // "table" ou "cards"

  const getVehicleInfo = (vehicleId: number) => {
    const vehicle = vehicles.find((v) => v.id === vehicleId)
    return vehicle ? `${vehicle.brand} ${vehicle.model} (${vehicle.licensePlate})` : "Véhicule inconnu"
  }

  const getGarageName = (garageId: number) => {
    const garage = garages.find((g) => g.id === garageId)
    if (!garage) return "Garage inconnu"

    if (garage.status === "suspended" && garage.suspensionReason) {
      return `${garage.name} (${garage.suspensionReason})`
    }
    return garage.name
  }

  // Obtenir les types d'intervention uniques
  const interventionTypes = [...new Set(records.map((record) => record.type))].sort()

  // Fonction de filtrage avancée
  const filteredRecords = records.filter((record) => {
    // Filtre par recherche
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase()
      const vehicleInfo = getVehicleInfo(record.vehicleId).toLowerCase()
      const garageName = getGarageName(record.garageId).toLowerCase()

      const matchesSearch =
        record.type.toLowerCase().includes(searchLower) ||
        record.description.toLowerCase().includes(searchLower) ||
        vehicleInfo.includes(searchLower) ||
        garageName.includes(searchLower) ||
        new Date(record.date).toLocaleDateString("fr-FR").includes(searchTerm) ||
        record.cost.toString().includes(searchTerm) ||
        (record.mileageAtService && record.mileageAtService.toString().includes(searchTerm))

      if (!matchesSearch) return false
    }

    // Filtre par véhicule
    if (selectedVehicle !== "all" && record.vehicleId !== Number.parseInt(selectedVehicle)) {
      return false
    }

    // Filtre par garage
    if (selectedGarage !== "all" && record.garageId !== Number.parseInt(selectedGarage)) {
      return false
    }

    // Filtre par type d'intervention
    if (selectedType !== "all" && record.type !== selectedType) {
      return false
    }

    // Filtre par période
    if (dateRange !== "all") {
      const recordDate = new Date(record.date)
      const now = new Date()

      switch (dateRange) {
        case "week":
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          if (recordDate < weekAgo) return false
          break
        case "month":
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          if (recordDate < monthAgo) return false
          break
        case "quarter":
          const quarterAgo = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000)
          if (recordDate < quarterAgo) return false
          break
        case "year":
          const yearAgo = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000)
          if (recordDate < yearAgo) return false
          break
      }
    }

    return true
  })

  // Fonction de tri
  const sortedRecords = [...filteredRecords].sort((a, b) => {
    let comparison = 0

    switch (sortBy) {
      case "date":
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
        break
      case "cost":
        comparison = a.cost - b.cost
        break
      case "vehicle":
        comparison = getVehicleInfo(a.vehicleId).localeCompare(getVehicleInfo(b.vehicleId))
        break
      case "type":
        comparison = a.type.localeCompare(b.type)
        break
      case "mileage":
        const aMileage = a.mileageAtService || 0
        const bMileage = b.mileageAtService || 0
        comparison = aMileage - bMileage
        break
      default:
        comparison = new Date(a.date).getTime() - new Date(b.date).getTime()
    }

    return sortOrder === "asc" ? comparison : -comparison
  })

  const clearAllFilters = () => {
    setSearchTerm("")
    setSelectedVehicle("all")
    setSelectedGarage("all")
    setSelectedType("all")
    setDateRange("all")
  }

  const toggleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc")
    } else {
      setSortBy(field)
      setSortOrder("desc")
    }
  }

  const generatePDF = () => {
    const doc = new jsPDF()

    // Configuration
    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 20
    let yPosition = margin

    // En-tête
    doc.setFontSize(20)
    doc.setFont("helvetica", "bold")
    doc.text("HISTORIQUE COMPLET DES ENTRETIENS", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 15

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text("Parc Automobile - OurParc", pageWidth / 2, yPosition, { align: "center" })
    yPosition += 20

    // Ligne de séparation
    doc.setLineWidth(0.5)
    doc.line(margin, yPosition, pageWidth - margin, yPosition)
    yPosition += 15

    // Filtres appliqués
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("FILTRES APPLIQUÉS", margin, yPosition)
    yPosition += 12

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    const appliedFilters = []
    if (searchTerm) appliedFilters.push(`Recherche: "${searchTerm}"`)
    if (selectedVehicle !== "all") {
      const vehicle = vehicles.find((v) => v.id === Number.parseInt(selectedVehicle))
      appliedFilters.push(`Véhicule: ${vehicle ? `${vehicle.brand} ${vehicle.model}` : "Inconnu"}`)
    }
    if (selectedGarage !== "all") {
      const garage = garages.find((g) => g.id === Number.parseInt(selectedGarage))
      appliedFilters.push(`Garage: ${garage ? garage.name : "Inconnu"}`)
    }
    if (selectedType !== "all") appliedFilters.push(`Type: ${selectedType}`)
    if (dateRange !== "all") {
      const periods = {
        week: "7 derniers jours",
        month: "30 derniers jours",
        quarter: "3 derniers mois",
        year: "12 derniers mois",
      }
      appliedFilters.push(`Période: ${periods[dateRange]}`)
    }

    if (appliedFilters.length === 0) {
      appliedFilters.push("Aucun filtre appliqué")
    }

    appliedFilters.forEach((filter) => {
      doc.text(filter, margin, yPosition)
      yPosition += 8
    })

    yPosition += 10

    // Statistiques globales
    doc.setFontSize(14)
    doc.setFont("helvetica", "bold")
    doc.text("STATISTIQUES", margin, yPosition)
    yPosition += 12

    doc.setFontSize(11)
    doc.setFont("helvetica", "normal")

    const totalCost = sortedRecords.reduce((sum, record) => sum + record.cost, 0)

    const globalStats = [
      `Total des entretiens: ${sortedRecords.length}`,
      `Coût total: ${totalCost.toFixed(2)} €`,
      `Coût moyen par entretien: ${sortedRecords.length > 0 ? (totalCost / sortedRecords.length).toFixed(2) : 0} €`,
      `Date de génération: ${new Date().toLocaleDateString("fr-FR")} à ${new Date().toLocaleTimeString("fr-FR")}`,
    ]

    globalStats.forEach((stat) => {
      doc.text(stat, margin, yPosition)
      yPosition += 8
    })

    yPosition += 15

    // Détail des entretiens
    if (sortedRecords.length > 0) {
      doc.setFontSize(14)
      doc.setFont("helvetica", "bold")
      doc.text("DÉTAIL DES ENTRETIENS", margin, yPosition)
      yPosition += 15

      // En-têtes du tableau
      doc.setFontSize(9)
      doc.setFont("helvetica", "bold")

      const headers = ["Date", "Véhicule", "Type", "Garage", "Kilométrage", "Coût"]
      const colWidths = [25, 40, 25, 35, 25, 20]
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

      sortedRecords.forEach((record, index) => {
        // Vérifier si on a besoin d'une nouvelle page
        if (yPosition > pageHeight - 40) {
          doc.addPage()
          yPosition = margin

          // Répéter les en-têtes sur la nouvelle page
          doc.setFontSize(9)
          doc.setFont("helvetica", "bold")
          xPosition = margin
          headers.forEach((header, index) => {
            doc.text(header, xPosition, yPosition)
            xPosition += colWidths[index]
          })
          yPosition += 5
          doc.setLineWidth(0.3)
          doc.line(margin, yPosition, pageWidth - margin, yPosition)
          yPosition += 8
          doc.setFont("helvetica", "normal")
        }

        xPosition = margin

        const rowData = [
          new Date(record.date).toLocaleDateString("fr-FR"),
          getVehicleInfo(record.vehicleId),
          record.type,
          getGarageName(record.garageId),
          record.mileageAtService ? `${record.mileageAtService.toLocaleString()} km` : "-",
          `${record.cost.toFixed(2)} €`,
        ]

        rowData.forEach((data, colIndex) => {
          // Tronquer le texte si trop long
          const maxLength = colIndex === 1 ? 20 : colIndex === 2 ? 15 : colIndex === 3 ? 20 : data.length
          const displayText = data.length > maxLength ? data.substring(0, maxLength) + "..." : data
          doc.text(displayText, xPosition, yPosition)
          xPosition += colWidths[colIndex]
        })

        yPosition += 7

        // Ligne de séparation légère
        if (index < sortedRecords.length - 1) {
          doc.setLineWidth(0.1)
          doc.line(margin, yPosition + 1, pageWidth - margin, yPosition + 1)
          yPosition += 3
        }
      })
    } else {
      doc.setFontSize(12)
      doc.setFont("helvetica", "italic")
      doc.text("Aucun entretien trouvé avec les filtres appliqués.", margin, yPosition)
    }

    // Pied de page sur toutes les pages
    const totalPages = doc.internal.getNumberOfPages()
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i)
      const footerY = pageHeight - 15
      doc.setFontSize(8)
      doc.setFont("helvetica", "normal")
      doc.text(`Page ${i} sur ${totalPages}`, margin, footerY)
      doc.text("Généré par OurParc - Système de gestion de parc automobile", pageWidth / 2, footerY, {
        align: "center",
      })
    }

    // Télécharger le PDF
    const fileName = `historique-entretiens-${new Date().toISOString().split("T")[0]}.pdf`
    doc.save(fileName)
  }

  const totalCost = sortedRecords.reduce((sum, record) => sum + record.cost, 0)
  const hasActiveFilters =
    searchTerm || selectedVehicle !== "all" || selectedGarage !== "all" || selectedType !== "all" || dateRange !== "all"

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Historique des Entretiens
            </CardTitle>
            <CardDescription>Suivi complet de tous les entretiens effectués avec filtres avancés</CardDescription>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant={viewMode === "table" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("table")}
            >
              Tableau
            </Button>
            <Button
              variant={viewMode === "cards" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("cards")}
            >
              Cartes
            </Button>
            <Button onClick={generatePDF} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Filtres avancés */}
        <div className="space-y-4 mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium flex items-center">
              <Filter className="mr-2 h-4 w-4" />
              Filtres de recherche
            </h3>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="mr-1 h-3 w-3" />
                Effacer tout
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Recherche globale */}
            <div className="relative">
              <Label htmlFor="search" className="text-xs font-medium text-gray-700">
                Recherche globale
              </Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  id="search"
                  placeholder="Rechercher..."
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
            </div>

            {/* Filtre par véhicule */}
            <div>
              <Label className="text-xs font-medium text-gray-700">Véhicule</Label>
              <Select value={selectedVehicle} onValueChange={setSelectedVehicle}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tous les véhicules" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  <SelectItem value="all">Tous les véhicules</SelectItem>
                  {vehicles.map((vehicle) => (
                    <SelectItem key={vehicle.id} value={vehicle.id.toString()}>
                      {vehicle.brand} {vehicle.model} ({vehicle.licensePlate})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par garage */}
            <div>
              <Label className="text-xs font-medium text-gray-700">Garage</Label>
              <Select value={selectedGarage} onValueChange={setSelectedGarage}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tous les garages" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  <SelectItem value="all">Tous les garages</SelectItem>
                  {garages.map((garage) => (
                    <SelectItem key={garage.id} value={garage.id.toString()}>
                      {garage.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par type d'intervention */}
            <div>
              <Label className="text-xs font-medium text-gray-700">Type d'intervention</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent className="max-h-48 overflow-y-auto">
                  <SelectItem value="all">Tous les types</SelectItem>
                  {interventionTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtre par période */}
            <div>
              <Label className="text-xs font-medium text-gray-700">Période</Label>
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Toutes les périodes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les périodes</SelectItem>
                  <SelectItem value="week">7 derniers jours</SelectItem>
                  <SelectItem value="month">30 derniers jours</SelectItem>
                  <SelectItem value="quarter">3 derniers mois</SelectItem>
                  <SelectItem value="year">12 derniers mois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Tri */}
            <div>
              <Label className="text-xs font-medium text-gray-700">Trier par</Label>
              <Select
                value={`${sortBy}-${sortOrder}`}
                onValueChange={(value) => {
                  const [field, order] = value.split("-")
                  setSortBy(field)
                  setSortOrder(order)
                }}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date-desc">Date (plus récent)</SelectItem>
                  <SelectItem value="date-asc">Date (plus ancien)</SelectItem>
                  <SelectItem value="cost-desc">Coût (plus élevé)</SelectItem>
                  <SelectItem value="cost-asc">Coût (moins élevé)</SelectItem>
                  <SelectItem value="vehicle-asc">Véhicule (A-Z)</SelectItem>
                  <SelectItem value="vehicle-desc">Véhicule (Z-A)</SelectItem>
                  <SelectItem value="type-asc">Type (A-Z)</SelectItem>
                  <SelectItem value="type-desc">Type (Z-A)</SelectItem>
                  <SelectItem value="mileage-desc">Kilométrage (plus élevé)</SelectItem>
                  <SelectItem value="mileage-asc">Kilométrage (moins élevé)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Statistiques des résultats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entretiens</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{sortedRecords.length}</div>
              <p className="text-xs text-muted-foreground">
                {hasActiveFilters ? `sur ${records.length} total` : "au total"}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Coût Total</CardTitle>
              <Euro className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCost.toFixed(2)} €</div>
              <p className="text-xs text-muted-foreground">
                Moyenne: {sortedRecords.length > 0 ? (totalCost / sortedRecords.length).toFixed(2) : 0} €
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Véhicules</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{new Set(sortedRecords.map((r) => r.vehicleId)).size}</div>
              <p className="text-xs text-muted-foreground">concernés</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Période</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-bold">
                {sortedRecords.length > 0 ? (
                  <>
                    {new Date(Math.min(...sortedRecords.map((r) => new Date(r.date).getTime()))).toLocaleDateString(
                      "fr-FR",
                    )}
                    <br />
                    au{" "}
                    {new Date(Math.max(...sortedRecords.map((r) => new Date(r.date).getTime()))).toLocaleDateString(
                      "fr-FR",
                    )}
                  </>
                ) : (
                  "Aucune donnée"
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Affichage des résultats */}
        {sortedRecords.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <FileText className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium mb-2">Aucun entretien trouvé</h3>
            <p className="text-sm mb-4">
              {hasActiveFilters
                ? "Aucun entretien ne correspond aux filtres appliqués"
                : "Aucun entretien enregistré pour le moment"}
            </p>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters}>
                <X className="mr-2 h-4 w-4" />
                Effacer tous les filtres
              </Button>
            )}
          </div>
        ) : (
          <>
            {viewMode === "table" ? (
              <div className="border rounded-lg overflow-hidden">
                <div className="max-h-[600px] overflow-y-auto">
                  <Table>
                    <TableHeader className="sticky top-0 bg-white z-10">
                      <TableRow>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => toggleSort("date")}>
                          <div className="flex items-center">
                            Date
                            {sortBy === "date" &&
                              (sortOrder === "asc" ? (
                                <SortAsc className="ml-1 h-3 w-3" />
                              ) : (
                                <SortDesc className="ml-1 h-3 w-3" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => toggleSort("vehicle")}>
                          <div className="flex items-center">
                            Véhicule
                            {sortBy === "vehicle" &&
                              (sortOrder === "asc" ? (
                                <SortAsc className="ml-1 h-3 w-3" />
                              ) : (
                                <SortDesc className="ml-1 h-3 w-3" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => toggleSort("type")}>
                          <div className="flex items-center">
                            Type
                            {sortBy === "type" &&
                              (sortOrder === "asc" ? (
                                <SortAsc className="ml-1 h-3 w-3" />
                              ) : (
                                <SortDesc className="ml-1 h-3 w-3" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead>Garage</TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => toggleSort("mileage")}>
                          <div className="flex items-center">
                            Kilométrage
                            {sortBy === "mileage" &&
                              (sortOrder === "asc" ? (
                                <SortAsc className="ml-1 h-3 w-3" />
                              ) : (
                                <SortDesc className="ml-1 h-3 w-3" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead className="cursor-pointer hover:bg-gray-50" onClick={() => toggleSort("cost")}>
                          <div className="flex items-center">
                            Coût
                            {sortBy === "cost" &&
                              (sortOrder === "asc" ? (
                                <SortAsc className="ml-1 h-3 w-3" />
                              ) : (
                                <SortDesc className="ml-1 h-3 w-3" />
                              ))}
                          </div>
                        </TableHead>
                        <TableHead>Description</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sortedRecords.map((record) => (
                        <TableRow key={record.id} className="hover:bg-gray-50">
                          <TableCell className="font-medium">
                            {new Date(record.date).toLocaleDateString("fr-FR")}
                          </TableCell>
                          <TableCell>
                            <div className="font-medium">{getVehicleInfo(record.vehicleId)}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary" className="text-xs">
                              {record.type}
                            </Badge>
                          </TableCell>
                          <TableCell>{getGarageName(record.garageId)}</TableCell>
                          <TableCell>
                            {record.mileageAtService ? `${record.mileageAtService.toLocaleString()} km` : "-"}
                          </TableCell>
                          <TableCell className="font-medium text-green-600">{record.cost.toFixed(2)} €</TableCell>
                          <TableCell>
                            <div className="max-w-xs truncate" title={record.description}>
                              {record.description}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="grid gap-4 max-h-[600px] overflow-y-auto">
                {sortedRecords.map((record) => (
                  <Card key={record.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold text-lg">{getVehicleInfo(record.vehicleId)}</h3>
                          <p className="text-sm text-gray-600">
                            {new Date(record.date).toLocaleDateString("fr-FR")} - {getGarageName(record.garageId)}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-green-600">{record.cost.toFixed(2)} €</div>
                          {record.mileageAtService && (
                            <div className="text-sm text-gray-500">{record.mileageAtService.toLocaleString()} km</div>
                          )}
                        </div>
                      </div>
                      <div className="mb-2">
                        <Badge variant="secondary">{record.type}</Badge>
                      </div>
                      <p className="text-sm text-gray-700">{record.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}
