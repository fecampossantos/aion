# Backup and Restore Feature

The Aion app now includes comprehensive backup and restore functionality to protect your time tracking data.

## Features

### Data Backup
- **Complete Data Export**: Backs up all projects, tasks, and time tracking data
- **JSON Format**: Uses standard JSON format for compatibility and readability
- **Automatic Timestamping**: Each backup includes creation timestamp and version info
- **Device Storage**: Saves backup files directly to your device's storage
- **Share Integration**: Uses native share dialog to save or send backup files

### Data Structure
The backup file contains:
```json
{
  "version": "1.0.0",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "data": {
    "projects": [...],
    "tasks": [...],
    "timings": [...]
  }
}
```

### User Interface
- **Backup Button**: Creates and downloads backup file with share dialog
- **Restore Button**: Shows instructions for data restoration (file picker coming in future update)
- **Loading States**: Visual feedback during backup/restore operations
- **Error Handling**: User-friendly error messages and recovery options

## How to Use

### Creating a Backup
1. Open the main screen of the Aion app
2. Scroll down to the database management section
3. Tap the "Backup Data" button (blue button with download icon)
4. Confirm the backup creation in the dialog
5. Use the share dialog to save the backup file to your preferred location
6. The backup file will be named `aion-backup-YYYY-MM-DD-HH-MM-SS.json`

### Restoring Data (Future Feature)
The restore functionality is currently in development. For now:
1. Keep your backup files safe in a secure location
2. Future updates will include a file picker for easy restoration
3. Contact support if you need immediate restoration assistance

## Technical Details

### File Location
- Backup files are created in the app's document directory
- Files are accessible through the native share dialog
- Compatible with cloud storage services (Google Drive, iCloud, etc.)

### Data Integrity
- Uses SQLite transactions for atomic operations
- Validates backup data structure before restoration
- Preserves all foreign key relationships
- Maintains auto-increment counters

### Permissions
The app requires the following permissions for backup functionality:
- `android.permission.WRITE_EXTERNAL_STORAGE`
- `android.permission.READ_EXTERNAL_STORAGE`

## Best Practices

1. **Regular Backups**: Create backups regularly, especially before major data operations
2. **Multiple Locations**: Store backups in multiple locations (device, cloud storage)
3. **Test Restores**: Verify backup files can be opened and contain expected data
4. **Version Tracking**: Keep track of backup dates and app versions

## Troubleshooting

### Common Issues
- **Backup Failed**: Check device storage space and permissions
- **Share Dialog Not Opening**: Verify device supports sharing functionality
- **Large File Size**: Normal for extensive time tracking data

### Error Messages
- "Sharing is not available on this device": Device doesn't support native sharing
- "Failed to create backup": Database access or storage permission issue
- "Invalid backup data structure": Corrupted or incompatible backup file

## Future Enhancements

- File picker integration for easy restore
- Selective backup/restore (specific date ranges or projects)
- Automatic backup scheduling
- Cloud storage integration
- Backup encryption for sensitive data

## Support

For technical support or questions about the backup/restore feature, please refer to the main README or contact the development team.