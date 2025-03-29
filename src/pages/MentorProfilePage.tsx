
// Update the Select component in the booking modal
<Select
  value={selectedSessionType}
  onValueChange={setSelectedSessionType}
>
  <SelectTrigger className="w-full">
    <SelectValue placeholder="Select session type" />
  </SelectTrigger>
  <SelectContent>
    {sessionTypes?.map((type) => (
      <SelectItem key={type.id} value={type.id}>
        {type.name} ({type.duration} min) - {type.price ? `$${type.price}` : 'Free'}
      </SelectItem>
    ))}
  </SelectContent>
</Select>

// Update the CalendarDateRangePicker in the booking modal
<CalendarDateRangePicker
  date={dateRange}
  onDateChange={setDateRange}
/>
