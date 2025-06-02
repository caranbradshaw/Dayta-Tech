"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, Activity, FileText, Shield, Search } from "lucide-react"
import { supabase } from "@/lib/supabase"
import type { UserActivity, AccountChange, FileActivity, Profile } from "@/types/database"

export function AdminDashboard() {
  const [userActivities, setUserActivities] = useState<UserActivity[]>([])
  const [accountChanges, setAccountChanges] = useState<AccountChange[]>([])
  const [fileActivities, setFileActivities] = useState<FileActivity[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [selectedUser, setSelectedUser] = useState<string>("")
  const [searchTerm, setSearchTerm] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setLoading(true)
    try {
      // Fetch user activities
      const { data: activities } = await supabase
        .from("user_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      // Fetch account changes
      const { data: changes } = await supabase
        .from("account_changes")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      // Fetch file activities
      const { data: fileActs } = await supabase
        .from("file_activities")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(100)

      // Fetch profiles
      const { data: userProfiles } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false })

      setUserActivities(activities || [])
      setAccountChanges(changes || [])
      setFileActivities(fileActs || [])
      setProfiles(userProfiles || [])
    } catch (error) {
      console.error("Error fetching data:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredActivities = userActivities.filter((activity) => {
    const matchesUser = selectedUser ? activity.user_id === selectedUser : true
    const matchesSearch = searchTerm
      ? activity.activity_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.activity_type.toLowerCase().includes(searchTerm.toLowerCase())
      : true
    return matchesUser && matchesSearch
  })

  const filteredChanges = accountChanges.filter((change) => {
    const matchesUser = selectedUser ? change.user_id === selectedUser : true
    const matchesSearch = searchTerm ? change.change_type.toLowerCase().includes(searchTerm.toLowerCase()) : true
    return matchesUser && matchesSearch
  })

  const filteredFileActivities = fileActivities.filter((activity) => {
    const matchesUser = selectedUser ? activity.user_id === selectedUser : true
    const matchesSearch = searchTerm
      ? activity.file_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        activity.activity_type.toLowerCase().includes(searchTerm.toLowerCase())
      : true
    return matchesUser && matchesSearch
  })

  const getActivityBadgeColor = (type: string) => {
    switch (type) {
      case "login":
        return "bg-green-100 text-green-800"
      case "logout":
        return "bg-gray-100 text-gray-800"
      case "file_upload":
        return "bg-blue-100 text-blue-800"
      case "analysis_complete":
        return "bg-purple-100 text-purple-800"
      case "error":
        return "bg-red-100 text-red-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <Button onClick={fetchData} variant="outline">
          Refresh Data
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profiles.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Activities</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userActivities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">File Activities</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fileActivities.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Changes</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{accountChanges.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </div>
            <Select value={selectedUser} onValueChange={setSelectedUser}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by user" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Users</SelectItem>
                {profiles.map((profile) => (
                  <SelectItem key={profile.id} value={profile.id}>
                    {profile.name || profile.email}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="outline"
              onClick={() => {
                setSelectedUser("")
                setSearchTerm("")
              }}
            >
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="activities" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activities">User Activities</TabsTrigger>
          <TabsTrigger value="changes">Account Changes</TabsTrigger>
          <TabsTrigger value="files">File Activities</TabsTrigger>
          <TabsTrigger value="users">User Management</TabsTrigger>
        </TabsList>

        <TabsContent value="activities">
          <Card>
            <CardHeader>
              <CardTitle>User Activities</CardTitle>
              <CardDescription>Track all user activities across the platform</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>IP Address</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredActivities.map((activity) => {
                    const user = profiles.find((p) => p.id === activity.user_id)
                    return (
                      <TableRow key={activity.id}>
                        <TableCell>{user?.name || user?.email || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge className={getActivityBadgeColor(activity.activity_type)}>
                            {activity.activity_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{activity.activity_description}</TableCell>
                        <TableCell>{activity.ip_address || "N/A"}</TableCell>
                        <TableCell>{new Date(activity.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="changes">
          <Card>
            <CardHeader>
              <CardTitle>Account Changes</CardTitle>
              <CardDescription>Review all account modifications and updates</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Change Type</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Changed By</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChanges.map((change) => {
                    const user = profiles.find((p) => p.id === change.user_id)
                    const changedBy = profiles.find((p) => p.id === change.changed_by)
                    return (
                      <TableRow key={change.id}>
                        <TableCell>{user?.name || user?.email || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{change.change_type}</Badge>
                        </TableCell>
                        <TableCell>{change.reason || "N/A"}</TableCell>
                        <TableCell>{changedBy?.name || changedBy?.email || "System"}</TableCell>
                        <TableCell>{new Date(change.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="files">
          <Card>
            <CardHeader>
              <CardTitle>File Activities</CardTitle>
              <CardDescription>Monitor file uploads, processing, and analysis activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Activity Type</TableHead>
                    <TableHead>File Name</TableHead>
                    <TableHead>File Size</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFileActivities.map((activity) => {
                    const user = profiles.find((p) => p.id === activity.user_id)
                    return (
                      <TableRow key={activity.id}>
                        <TableCell>{user?.name || user?.email || "Unknown"}</TableCell>
                        <TableCell>
                          <Badge className={getActivityBadgeColor(activity.activity_type)}>
                            {activity.activity_type}
                          </Badge>
                        </TableCell>
                        <TableCell>{activity.file_name || "N/A"}</TableCell>
                        <TableCell>
                          {activity.file_size ? `${(activity.file_size / 1024 / 1024).toFixed(2)} MB` : "N/A"}
                        </TableCell>
                        <TableCell>{new Date(activity.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
              <CardDescription>Manage user accounts and view user details</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Company</TableHead>
                    <TableHead>Account Type</TableHead>
                    <TableHead>Trial Status</TableHead>
                    <TableHead>Credits</TableHead>
                    <TableHead>Joined</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {profiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>{profile.name || "N/A"}</TableCell>
                      <TableCell>{profile.email}</TableCell>
                      <TableCell>{profile.company || "N/A"}</TableCell>
                      <TableCell>
                        <Badge variant={profile.account_type === "premium" ? "default" : "secondary"}>
                          {profile.account_type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={profile.trial_status === "active" ? "default" : "destructive"}>
                          {profile.trial_status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        Upload: {profile.upload_credits} | Export: {profile.export_credits}
                      </TableCell>
                      <TableCell>{new Date(profile.created_at).toLocaleDateString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
