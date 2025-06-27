<RadioGroup value={selectedRole} onValueChange={setSelectedRole} className="space-y-4">
  {roles.map((role) => {
    const Icon = role.icon
    return (
      <Label
        key={role.id}
        htmlFor={role.id}
        className={`flex items-center space-x-3 p-4 border rounded-lg hover:bg-gray-50 cursor-pointer ${
          selectedRole === role.id ? "border-blue-500 ring-2 ring-blue-300" : "border-gray-200"
        }`}
      >
        <RadioGroupItem value={role.id} id={role.id} />
        <div className="flex items-center space-x-3 flex-1">
          <Icon className="h-6 w-6 text-blue-600" />
          <div>
            <div className="text-base font-medium">{role.title}</div>
            <p className="text-sm text-gray-500">{role.description}</p>
          </div>
        </div>
      </Label>
    )
  })}
</RadioGroup>
