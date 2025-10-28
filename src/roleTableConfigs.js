export const roleTableConfigs = {
  // Accountant - Finance related tables
  accountant: {
    employee: {
      displayName: 'Employees',
      columns: ['empid', 'full_name', 'email', 'department', 'basicsalary', 'status'],
      formFields: [
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'department', label: 'Department', type: 'text' },
        { name: 'basicsalary', label: 'Basic Salary', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] }
      ]
    },
    salary: {
      displayName: 'Salary Records',
      columns: ['salaryid', 'empid', 'basicsalary', 'totalsalary', 'net_salary', 'salarydate'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'basicsalary', label: 'Basic Salary', type: 'number', required: true },
        { name: 'otpay', label: 'OT Pay', type: 'number' },
        { name: 'bonuspay', label: 'Bonus Pay', type: 'number' },
        { name: 'totalsalary', label: 'Total Salary', type: 'number' },
        { name: 'deductions', label: 'Deductions', type: 'number' },
        { name: 'net_salary', label: 'Net Salary', type: 'number' },
        { name: 'salarydate', label: 'Salary Date', type: 'date', required: true }
      ]
    },
    bonus: {
      displayName: 'Bonus Records',
      columns: ['bonusid', 'empid', 'type', 'amount', 'bonusdate', 'status'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'type', label: 'Bonus Type', type: 'select', options: ['performance', 'festival', 'annual', 'special'] },
        { name: 'amount', label: 'Amount', type: 'number', required: true },
        { name: 'reason', label: 'Reason', type: 'textarea' },
        { name: 'bonusdate', label: 'Bonus Date', type: 'date', required: true },
        { name: 'status', label: 'Status', type: 'select', options: ['approved', 'pending', 'rejected'] }
      ]
    },
    loanrequest: {
      displayName: 'Loan Requests',
      columns: ['loanrequestid', 'empid', 'loantype', 'amount', 'duration', 'status', 'date'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'loantype', label: 'Loan Type', type: 'select', options: ['personal', 'emergency', 'housing'] },
        { name: 'amount', label: 'Amount', type: 'number', required: true },
        { name: 'duration', label: 'Duration (months)', type: 'number', required: true },
        { name: 'status', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] }
      ]
    },
    epf_contributions: {
      displayName: 'EPF Contributions',
      columns: ['id', 'empid', 'basicsalary', 'employeecontribution', 'employercontribution', 'month'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'basicsalary', label: 'Basic Salary', type: 'number', required: true },
        { name: 'employeecontribution', label: 'Employee Contribution', type: 'number' },
        { name: 'employercontribution', label: 'Employer Contribution', type: 'number' },
        { name: 'month', label: 'Month', type: 'date', required: true }
      ]
    },
    etf_contributions: {
      displayName: 'ETF Contributions',
      columns: ['id', 'empid', 'basicsalary', 'employercontribution', 'month'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'basicsalary', label: 'Basic Salary', type: 'number', required: true },
        { name: 'employercontribution', label: 'Employer Contribution', type: 'number' },
        { name: 'month', label: 'Month', type: 'date', required: true }
      ]
    },
    financialreports: {
      displayName: 'Financial Reports',
      columns: ['reportid', 'quarterenddate', 'totalrevenue', 'totalsalarycost', 'netprofit', 'report_year'],
      formFields: [
        { name: 'quarterenddate', label: 'Quarter End Date', type: 'date', required: true },
        { name: 'totalrevenue', label: 'Total Revenue', type: 'number', required: true },
        { name: 'totalsalarycost', label: 'Total Salary Cost', type: 'number', required: true },
        { name: 'totalepfcost', label: 'Total EPF Cost', type: 'number' },
        { name: 'totaletfcost', label: 'Total ETF Cost', type: 'number' },
        { name: 'netprofit', label: 'Net Profit', type: 'number', required: true },
        { name: 'report_year', label: 'Report Year', type: 'number', required: true }
      ]
    },
    ot: {
      displayName: 'Overtime Records',
      columns: ['otid', 'empid', 'othours', 'rate', 'amount', 'ot_date'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'othours', label: 'OT Hours', type: 'number', required: true },
        { name: 'rate', label: 'Rate', type: 'number', required: true },
        { name: 'amount', label: 'Amount', type: 'number' },
        { name: 'ot_date', label: 'OT Date', type: 'date', required: true }
      ]
    }
  },

  // Manager - Training and team management
  manager: {
    employee: {
      displayName: 'Team Members',
      columns: ['empid', 'full_name', 'email', 'department', 'position', 'status'],
      formFields: [
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'department', label: 'Department', type: 'text' },
        { name: 'position', label: 'Position', type: 'text' }
      ]
    },
    training: {
      displayName: 'Training Sessions',
      columns: ['trainingid', 'topic', 'trainer', 'date', 'status', 'max_participants'],
      formFields: [
        { name: 'topic', label: 'Topic', type: 'text', required: true },
        { name: 'trainer', label: 'Trainer', type: 'text', required: true },
        { name: 'venue', label: 'Venue', type: 'text' },
        { name: 'duration', label: 'Duration', type: 'text' },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'starttime', label: 'Start Time', type: 'time' },
        { name: 'endtime', label: 'End Time', type: 'time' },
        { name: 'max_participants', label: 'Max Participants', type: 'number' },
        { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'completed', 'cancelled'] }
      ]
    },
    training_participants: {
      displayName: 'Training Participants',
      columns: ['id', 'trainingid', 'empid', 'status', 'attendance_status', 'rating'],
      formFields: [
        { name: 'trainingid', label: 'Training ID', type: 'text', required: true },
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'attended', 'absent'] },
        { name: 'attendance_status', label: 'Attendance Status', type: 'select', options: ['present', 'absent'] },
        { name: 'rating', label: 'Rating', type: 'number', min: 1, max: 5 }
      ]
    },
    tasks: {
      displayName: 'Team Tasks',
      columns: ['id', 'title', 'priority', 'due_date', 'status', 'assignee_id'],
      formFields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'priority', label: 'Priority', type: 'select', options: ['low', 'medium', 'high'] },
        { name: 'due_date', label: 'Due Date', type: 'date', required: true },
        { name: 'assignee_id', label: 'Assignee ID', type: 'text', required: true },
        { name: 'status', label: 'Status', type: 'select', options: ['pending', 'in-progress', 'completed'] }
      ]
    },
    performance_rating: {
      displayName: 'Performance Ratings',
      columns: ['ratingid', 'empid', 'rating', 'rating_date', 'rating_period'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'rating', label: 'Rating', type: 'number', min: 1, max: 5, required: true },
        { name: 'comments', label: 'Comments', type: 'textarea' },
        { name: 'rating_date', label: 'Rating Date', type: 'date', required: true },
        { name: 'rating_period', label: 'Rating Period', type: 'text' }
      ]
    },
    meeting: {
      displayName: 'Meetings',
      columns: ['meetingid', 'topic', 'date', 'starttime', 'endtime', 'status'],
      formFields: [
        { name: 'topic', label: 'Topic', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'starttime', label: 'Start Time', type: 'time', required: true },
        { name: 'endtime', label: 'End Time', type: 'time', required: true },
        { name: 'location', label: 'Location', type: 'text' },
        { name: 'status', label: 'Status', type: 'select', options: ['scheduled', 'completed', 'cancelled'] }
      ]
    }
  },

  // CEO - Strategic overview and all reports
  ceo: {
    employee: {
      displayName: 'All Employees',
      columns: ['empid', 'full_name', 'email', 'department', 'role', 'status', 'basicsalary'],
      formFields: []
    },
    financialreports: {
      displayName: 'Financial Reports',
      columns: ['reportid', 'quarterenddate', 'totalrevenue', 'netprofit', 'report_year'],
      formFields: []
    },
    departments: {
      displayName: 'Departments',
      columns: ['departmentid', 'departmentname', 'description', 'manager_id', 'is_active'],
      formFields: []
    },
    strategic_goals: {
      displayName: 'Strategic Goals',
      columns: ['goal_id', 'goal_name', 'year', 'quarter', 'target_value', 'current_value', 'achieved'],
      formFields: [
        { name: 'goal_name', label: 'Goal Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'year', label: 'Year', type: 'number', required: true },
        { name: 'quarter', label: 'Quarter', type: 'number', required: true },
        { name: 'target_value', label: 'Target Value', type: 'number', required: true },
        { name: 'current_value', label: 'Current Value', type: 'number' },
        { name: 'achieved', label: 'Achieved', type: 'switch' },
        { name: 'deadline', label: 'Deadline', type: 'date' }
      ]
    },
    kpi: {
      displayName: 'KPI Metrics',
      columns: ['kpiid', 'empid', 'kpivalue', 'calculatedate', 'period'],
      formFields: []
    },
    hr_reports: {
      displayName: 'HR Reports',
      columns: ['id', 'report_name', 'report_type', 'report_date', 'status'],
      formFields: []
    }
  },

  hr: {
    employee: {
      displayName: 'Employees',
      columns: ['empid', 'full_name', 'email', 'phone', 'department', 'role', 'status', 'kpiscore'],
      formFields: [
        { name: 'full_name', label: 'Full Name', type: 'text', required: true },
        { name: 'email', label: 'Email', type: 'email', required: true },
        { name: 'phone', label: 'Phone', type: 'text' },
        { name: 'role', label: 'Role', type: 'select', options: ['admin', 'manager', 'employee', 'hr', 'accountant', 'ceo'] },
        { name: 'department', label: 'Department', type: 'text' },
        { name: 'gender', label: 'Gender', type: 'select', options: ['Male', 'Female', 'Other'] },
        { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
        { name: 'basicsalary', label: 'Basic Salary', type: 'number' },
        { name: 'kpiscore', label: 'KPI Score', type: 'number', min: 0, max: 100 },
        { name: 'join_date', label: 'Join Date', type: 'date' }
      ]
    },
    kpi: {
      displayName: 'KPI Records',
      columns: ['kpiid', 'empid', 'kpivalue', 'calculatedate', 'kpiyear'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'kpivalue', label: 'KPI Value', type: 'number', min: 0, max: 100, required: true },
        { name: 'calculatedate', label: 'Calculation Date', type: 'date', required: true },
        { name: 'kpiyear', label: 'KPI Year', type: 'number', required: true }
      ]
    },
    kpi_categories: {
      displayName: 'KPI Categories',
      columns: ['id', 'category_name', 'description', 'weight', 'is_active'],
      formFields: [
        { name: 'category_name', label: 'Category Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'weight', label: 'Weight', type: 'number', min: 1, max: 10 },
        { name: 'is_active', label: 'Active', type: 'switch' }
      ]
    },
    kpi_details: {
      displayName: 'KPI Details',
      columns: ['id', 'kpiid', 'category_id', 'score', 'comments'],
      formFields: [
        { name: 'kpiid', label: 'KPI ID', type: 'text', required: true },
        { name: 'category_id', label: 'Category ID', type: 'text', required: true },
        { name: 'score', label: 'Score', type: 'number', min: 0, max: 100, required: true },
        { name: 'comments', label: 'Comments', type: 'textarea' }
      ]
    },
    performance_rating: {
      displayName: 'Performance Ratings',
      columns: ['ratingid', 'empid', 'rating', 'rating_date', 'comments'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'rating', label: 'Rating', type: 'number', min: 1, max: 5, required: true },
        { name: 'comments', label: 'Comments', type: 'textarea' },
        { name: 'rating_date', label: 'Rating Date', type: 'date', required: true }
      ]
    },
    employeeleave: {
      displayName: 'Leave Requests',
      columns: ['leaveid', 'empid', 'leavetype', 'leavefromdate', 'leavetodate', 'leavestatus'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'leavetype', label: 'Leave Type', type: 'select', options: ['sick', 'casual', 'annual', 'emergency'] },
        { name: 'leavefromdate', label: 'From Date', type: 'date', required: true },
        { name: 'leavetodate', label: 'To Date', type: 'date', required: true },
        { name: 'duration', label: 'Duration', type: 'number' },
        { name: 'leavestatus', label: 'Status', type: 'select', options: ['pending', 'approved', 'rejected'] },
        { name: 'remarks', label: 'Remarks', type: 'textarea' }
      ]
    },
    attendance: {
      displayName: 'Attendance',
      columns: ['attendanceid', 'empid', 'date', 'intime', 'outtime', 'status', 'hours_worked'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'date', label: 'Date', type: 'date', required: true },
        { name: 'intime', label: 'In Time', type: 'time' },
        { name: 'outtime', label: 'Out Time', type: 'time' },
        { name: 'status', label: 'Status', type: 'select', options: ['present', 'absent', 'late', 'half-day'] },
        { name: 'hours_worked', label: 'Hours Worked', type: 'number' }
      ]
    },
    employee_feedback: {
      displayName: 'Employee Feedback',
      columns: ['id', 'empid', 'feedback_type', 'subject', 'rating', 'status'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'feedback_type', label: 'Feedback Type', type: 'select', options: ['general', 'suggestion', 'complaint', 'appreciation'] },
        { name: 'subject', label: 'Subject', type: 'text', required: true },
        { name: 'rating', label: 'Rating', type: 'number', min: 1, max: 5 },
        { name: 'status', label: 'Status', type: 'select', options: ['submitted', 'reviewed', 'responded'] }
      ]
    },
    departments: {
      displayName: 'Departments',
      columns: ['departmentid', 'departmentname', 'description', 'manager_id', 'is_active'],
      formFields: [
        { name: 'departmentname', label: 'Department Name', type: 'text', required: true },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'manager_id', label: 'Manager ID', type: 'text' },
        { name: 'is_active', label: 'Active', type: 'switch' }
      ]
    },
    positions: {
      displayName: 'Positions',
      columns: ['position_id', 'title', 'department', 'status', 'salary_range'],
      formFields: [
        { name: 'title', label: 'Title', type: 'text', required: true },
        { name: 'department', label: 'Department', type: 'text', required: true },
        { name: 'status', label: 'Status', type: 'select', options: ['open', 'closed', 'filled'] },
        { name: 'description', label: 'Description', type: 'textarea' },
        { name: 'requirements', label: 'Requirements', type: 'textarea' }
      ]
    },
    promotion: {
      displayName: 'Promotions',
      columns: ['promotionid', 'empid', 'oldposition', 'newposition', 'promotiondate'],
      formFields: [
        { name: 'empid', label: 'Employee ID', type: 'text', required: true },
        { name: 'oldposition', label: 'Old Position', type: 'text', required: true },
        { name: 'newposition', label: 'New Position', type: 'text', required: true },
        { name: 'promotiondate', label: 'Promotion Date', type: 'date', required: true },
        { name: 'salaryincrease', label: 'Salary Increase', type: 'number' }
      ]
    }
  }
};