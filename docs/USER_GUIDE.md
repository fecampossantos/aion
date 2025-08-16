# User Guide - Chrono Time Tracking App

## Getting Started

Welcome to Chrono! This guide will walk you through all the features of the time tracking app, helping you efficiently manage your projects and track your time.

## Table of Contents

1. [First Launch](#first-launch)
2. [Managing Projects](#managing-projects)
3. [Working with Tasks](#working-with-tasks)
4. [Time Tracking](#time-tracking)
5. [Viewing Reports](#viewing-reports)
6. [Tips & Best Practices](#tips--best-practices)
7. [Troubleshooting](#troubleshooting)

## First Launch

When you first open Chrono, you'll see:

1. **Welcome Screen**: The main screen displays "Chrono" at the top
2. **Empty State**: If no projects exist, you'll see "Você ainda não tem projetos" (You don't have projects yet)
3. **Add Button**: A "+" button in the top-right corner to create your first project

### Sample Data
The app comes with sample data to help you get started:
- **Sample Project**: "projeto exemplo" with a $10/hour rate
- **Sample Task**: "task exemplo" 
- **Sample Time Entries**: Two timing entries to demonstrate the system

## Managing Projects

### Creating a New Project

1. **Access Creation Screen**:
   - Tap the "+" button on the home screen
   - You'll navigate to the "Add Project" screen

2. **Enter Project Details**:
   - **Project Name**: Enter a descriptive name for your project
   - **Hourly Rate**: Set your billing rate per hour (optional, defaults to $0.00)

3. **Save the Project**:
   - Tap "adicionar projeto" (add project) to save
   - You'll automatically return to the home screen

### Project Validation Rules

- **Unique Names**: Project names must be unique
- **Required Field**: Project name cannot be empty
- **Error Handling**: Clear error messages guide you if validation fails

### Viewing Projects

Back on the home screen, you'll see:
- **Project List**: All your projects displayed as cards
- **Project Cards**: Show project name with a right arrow
- **Navigation**: Tap any project card to view details

### Editing Projects

1. Navigate to a project
2. Access project information
3. Tap edit options to modify:
   - Project name
   - Hourly rate
   - Other project details

### Deleting Projects

When you delete a project:
- All associated tasks are automatically deleted
- All time tracking data for those tasks is removed
- This action cannot be undone

## Working with Tasks

### Creating Tasks

1. **Navigate to Project**:
   - Tap on a project from the home screen
   - You'll see the project details page

2. **Add New Task**:
   - Look for "Adicionar tarefa" (Add task) button
   - Tap to open the task creation screen

3. **Enter Task Details**:
   - **Task Name**: Provide a clear, descriptive name
   - **Task Description**: Add details about what needs to be done

4. **Save Task**:
   - Confirm to create the task
   - Return to the project view to see your new task

### Task Management

#### Viewing Tasks
- Tasks appear as a list within each project
- Each task shows:
  - Task name
  - Completion status (checkbox)
  - Associated timer controls

#### Marking Tasks Complete
- **Checkbox Interface**: Tap the checkbox next to any task
- **Visual Feedback**: Completed tasks show a checkmark
- **Database Update**: Completion status is immediately saved

#### Task Status
Tasks have two states:
- **Incomplete (0)**: Active tasks you're working on
- **Complete (1)**: Finished tasks marked as done

### Task Organization Tips

1. **Descriptive Names**: Use clear, specific task names
2. **Logical Breakdown**: Split large tasks into smaller, manageable parts
3. **Regular Updates**: Mark tasks complete as you finish them
4. **Time Estimation**: Consider how long each task might take

## Time Tracking

The timer is the core feature of Chrono, allowing precise time tracking for any task.

### Using the Timer

#### Starting Time Tracking

1. **Navigate to Task**:
   - Go to project → select specific task
   - You'll see the timer interface

2. **Start Timer**:
   - Tap the timer button (shows play icon ▶️)
   - **Haptic Feedback**: Feel a gentle vibration confirming the start
   - **Notification**: A system notification appears showing timer is running

3. **Timer Display**:
   - Format: `HH:MM:SS` (hours:minutes:seconds)
   - Updates in real-time every second
   - Shows current session time

#### Timer Running State

When the timer is active:
- **Visual Indicator**: Pause icon (⏸️) replaces play icon
- **Background Notification**: Persistent notification shows:
  - "Timer for [Task Name] running"
  - "Started at [Start Time]"
- **Real-time Updates**: Second-by-second counting

#### Stopping Time Tracking

1. **Stop Timer**:
   - Tap the timer button again (shows pause icon ⏸️)
   - **Haptic Feedback**: Confirms the stop action
   - **Automatic Save**: Time is immediately saved to database

2. **Time Recording**:
   - Total seconds are recorded in the database
   - Associated with the specific task
   - Timestamped with current date/time

### Manual Time Entry

If you forgot to use the timer or need to add historical time:

1. **Access Manual Entry**:
   - Look for "AddRecord" or manual time entry option
   - Usually available from task detail screens

2. **Enter Time Data**:
   - Input the amount of time spent
   - Specify the date if different from today
   - Add any relevant notes

3. **Save Entry**:
   - Confirm to add the manual time record
   - Time is stored same as timer-tracked time

### Timer Features

#### Notifications
- **Background Tracking**: Timer runs even when app is minimized
- **Persistent Notification**: Always shows timer status
- **Custom Messages**: Notifications include task name and start time

#### Haptic Feedback
- **Start Action**: Light vibration when starting timer
- **Stop Action**: Feedback when stopping timer
- **Enhanced UX**: Confirms actions without looking at screen

#### Precision Tracking
- **Second Accuracy**: Tracks time to the second
- **Continuous Counting**: No time lost during app switches
- **Reliable Storage**: All time data persisted to local database

### Time Display Formats

Throughout the app, time is displayed as:
- **Timer Display**: `00:00:00` (HH:MM:SS)
- **Reports**: May show decimal hours or HH:MM format
- **Calculations**: Precise to the second for cost calculations

## Viewing Reports

### Accessing Reports

1. **Navigate to Project Reports**:
   - Go to any project
   - Look for "Ver relatório" (View report) option
   - Tap to access the reporting screen

### Report Configuration

#### Date Range Selection

1. **Start Date**:
   - Default: 7 days ago from today
   - Tap calendar icon to change
   - Select custom start date

2. **End Date**:
   - Default: Today
   - Tap calendar icon to change
   - Must be after start date

3. **Date Picker**:
   - Native date picker interface
   - Cannot select future dates
   - End date cannot be before start date

### Report Data

Reports include:
- **Time Breakdown**: Time spent per task within date range
- **Task Status**: Completed vs incomplete tasks
- **Cost Calculations**: Based on project hourly rate
- **Date Information**: When each time entry was recorded

### Report Generation

#### PDF Reports (In Development)
- **Current Status**: PDF generation is temporarily disabled
- **Planned Features**:
  - Detailed time breakdown by task
  - Cost calculations and totals
  - Professional formatting
  - Shareable PDF files

#### Data Export
Future versions may include:
- CSV export for spreadsheet analysis
- JSON export for data integration
- Email sharing capabilities

### Understanding Report Data

#### Time Calculations
- **Total Time**: Sum of all timing entries in date range
- **Task Breakdown**: Time per individual task
- **Daily Summaries**: How much time per day

#### Cost Calculations
Based on project hourly rate:
- **Hourly Cost**: Full hours × hourly rate
- **Minute Cost**: Minutes × (hourly rate ÷ 60)
- **Second Cost**: Seconds × (hourly rate ÷ 3600)
- **Total Cost**: Sum of all time costs

## Tips & Best Practices

### Project Organization

1. **Consistent Naming**: Use clear, consistent naming conventions
2. **Rate Setting**: Set accurate hourly rates for billing purposes
3. **Project Scope**: Keep projects focused and well-defined

### Task Management

1. **Granular Tasks**: Break work into specific, trackable tasks
2. **Regular Updates**: Mark tasks complete promptly
3. **Descriptive Names**: Use task names that clearly describe the work

### Time Tracking Best Practices

1. **Start Immediately**: Begin timing when you start working
2. **Single Focus**: Track one task at a time
3. **Regular Breaks**: Stop timer during breaks for accuracy
4. **Review Regularly**: Check tracked time for reasonableness

### Data Management

1. **Regular Backups**: The app stores data locally - consider backup strategies
2. **Cleanup**: Periodically review and clean old data
3. **Validation**: Double-check important time entries

### Productivity Tips

1. **Timer Discipline**: Develop habit of starting/stopping timer consistently
2. **Task Planning**: Plan tasks before starting time tracking
3. **Report Review**: Regularly review reports to understand time usage
4. **Goal Setting**: Use time data to set realistic project timelines

## Troubleshooting

### Common Issues

#### Timer Not Starting
**Symptoms**: Timer button doesn't respond
**Solutions**:
1. Check if app has notification permissions
2. Restart the app
3. Ensure task is properly selected

#### Missing Time Data
**Symptoms**: Time entries not appearing
**Solutions**:
1. Verify timer was properly stopped
2. Check date range in reports
3. Ensure task belongs to correct project

#### App Performance Issues
**Symptoms**: Slow response, crashes
**Solutions**:
1. Restart the app
2. Check available device storage
3. Update to latest version if available

#### Notification Problems
**Symptoms**: No timer notifications
**Solutions**:
1. Check app notification permissions in device settings
2. Verify "Do Not Disturb" mode isn't blocking notifications
3. Restart the app

### Error Messages

#### "O nome do projeto nao pode estar vazio"
- **Translation**: "Project name cannot be empty"
- **Solution**: Enter a valid project name before saving

#### "Um projeto com esse nome já existe"
- **Translation**: "A project with this name already exists"
- **Solution**: Choose a different, unique project name

#### Database Errors
- **Symptoms**: "Database operation failed" messages
- **Solutions**:
  1. Restart the app
  2. Check device storage space
  3. Contact support if persistent

### Data Recovery

If you experience data loss:
1. **Check Recent Backups**: Look for any backup files
2. **App Reinstall**: Data is stored locally and may be lost on reinstall
3. **Export Options**: Use any available export features regularly

### Performance Optimization

To maintain optimal performance:
1. **Regular Cleanup**: Archive or delete old projects periodically
2. **Storage Management**: Ensure adequate device storage
3. **App Updates**: Keep the app updated to latest version

### Getting Help

If you need additional assistance:
1. **Documentation**: Review this guide and API documentation
2. **Error Logs**: Note specific error messages
3. **Support Channels**: Contact support through available channels

## Keyboard Shortcuts & Gestures

### Navigation
- **Back Navigation**: Use device back button or swipe gestures
- **Home Navigation**: Tap "Chrono" header to return home

### Input Fields
- **Text Input**: Standard keyboard input for all text fields
- **Currency Input**: Specialized number input for hourly rates
- **Date Picker**: Native date selection interface

### Accessibility

The app supports standard accessibility features:
- **Screen Readers**: Compatible with device screen readers
- **High Contrast**: Respects system contrast settings
- **Font Scaling**: Adapts to system font size preferences

---

**Need more help?** Check the [API Documentation](API.md) for technical details or [Architecture Documentation](ARCHITECTURE.md) for system information.