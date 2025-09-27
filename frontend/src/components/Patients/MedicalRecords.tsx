export default function MedicalRecords() {
    return <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h1 className="text-3xl font-bold text-primary">Patient Management</h1>
                <p className="text-muted-foreground">Medical Records</p>
            </div>
        </div>
    </div>
}