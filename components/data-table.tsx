import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export function DataTable() {
  // Sample data for demonstration
  const data = [
    { id: 1, region: "Northeast", revenue: "$245,000", growth: "32%", cac: "$120", retention: "78%" },
    { id: 2, region: "Southeast", revenue: "$198,000", growth: "24%", cac: "$145", retention: "72%" },
    { id: 3, region: "Midwest", revenue: "$210,000", growth: "18%", cac: "$135", retention: "75%" },
    { id: 4, region: "Southwest", revenue: "$156,000", growth: "12%", cac: "$160", retention: "68%" },
    { id: 5, region: "West", revenue: "$225,000", growth: "28%", cac: "$130", retention: "76%" },
  ]

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Region</TableHead>
            <TableHead>Revenue (Q2)</TableHead>
            <TableHead>Growth (Q1 to Q2)</TableHead>
            <TableHead>Customer Acquisition Cost</TableHead>
            <TableHead>Customer Retention</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.region}</TableCell>
              <TableCell>{row.revenue}</TableCell>
              <TableCell>{row.growth}</TableCell>
              <TableCell>{row.cac}</TableCell>
              <TableCell>{row.retention}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
