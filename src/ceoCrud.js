import { supabase } from './supabase';

// CEO CRUD operations with comprehensive logging
export const ceoCrud = {
  // GET all records with CEO-level access
  getAll: async (table, columns = '*', filters = {}) => {
    console.log('🎬 ===== CEO GET ALL OPERATION STARTED =====');
    console.log('📋 CEO Get All details:', { table, columns, filters });

    try {
      let query = supabase.from(table).select(columns);

      // Apply filters if provided
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== null) {
          query = query.eq(key, filters[key]);
        }
      });

      const { data, error, count } = await query;

      if (error) {
        console.error('❌ CEO Get All operation failed:', error);
        throw error;
      }

      console.log('✅ CEO Get All operation successful');
      console.log('📦 Retrieved data count:', data?.length);
      return { success: true, data, count };

    } catch (error) {
      console.error('💥 CEO Get All operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== CEO GET ALL OPERATION COMPLETED =====');
    }
  },

  // CREATE record with CEO logging
  create: async (table, data, ceoId) => {
    console.log('🎬 ===== CEO CREATE OPERATION STARTED =====');
    console.log('📋 CEO Create details:', { table, data, ceoId });

    try {
      const { data: result, error } = await supabase
        .from(table)
        .insert([{ 
          ...data, 
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('❌ CEO Create operation failed:', error);
        throw error;
      }

      console.log('✅ CEO Create operation successful');
      console.log('📦 Created data:', result);
      
      // Log the operation in md_operations
      await ceoCrud.create('md_operations', {
        operation: 'CREATE',
        record_id: result[0]?.id || result[0]?.empid || result[0]?.reportid,
        md_id: ceoId,
        details: JSON.stringify({
          table: table,
          data: data,
          result: result[0]
        }),
        email: data.email || 'ceo@system',
        operation_time: new Date().toISOString()
      });

      return { success: true, data: result };

    } catch (error) {
      console.error('💥 CEO Create operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== CEO CREATE OPERATION COMPLETED =====');
    }
  },

  // UPDATE record with CEO logging
  update: async (table, recordId, updates, ceoId, idColumn = 'id') => {
    console.log('🎬 ===== CEO UPDATE OPERATION STARTED =====');
    console.log('📋 CEO Update details:', { table, recordId, updates, ceoId, idColumn });

    try {
      // First get old values for audit
      const { data: oldData } = await supabase
        .from(table)
        .select('*')
        .eq(idColumn, recordId)
        .single();

      const { data, error } = await supabase
        .from(table)
        .update({ 
          ...updates, 
          updated_at: new Date().toISOString() 
        })
        .eq(idColumn, recordId)
        .select();

      if (error) {
        console.error('❌ CEO Update operation failed:', error);
        throw error;
      }

      console.log('✅ CEO Update operation successful');
      console.log('📦 Updated data:', data);

      // Log the operation in md_operations
      await ceoCrud.create('md_operations', {
        operation: 'UPDATE',
        record_id: recordId,
        md_id: ceoId,
        details: JSON.stringify({
          table: table,
          old_data: oldData,
          new_data: updates,
          result: data[0]
        }),
        email: updates.email || 'ceo@system',
        operation_time: new Date().toISOString()
      });

      return { success: true, data };

    } catch (error) {
      console.error('💥 CEO Update operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== CEO UPDATE OPERATION COMPLETED =====');
    }
  },

  // DELETE record with CEO logging
  delete: async (table, recordId, ceoId, idColumn = 'id') => {
    console.log('🎬 ===== CEO DELETE OPERATION STARTED =====');
    console.log('📋 CEO Delete details:', { table, recordId, ceoId, idColumn });

    try {
      // First get old values for audit
      const { data: oldData } = await supabase
        .from(table)
        .select('*')
        .eq(idColumn, recordId)
        .single();

      const { error } = await supabase
        .from(table)
        .delete()
        .eq(idColumn, recordId);

      if (error) {
        console.error('❌ CEO Delete operation failed:', error);
        throw error;
      }

      console.log('✅ CEO Delete operation successful');

      // Log the operation in md_operations
      await ceoCrud.create('md_operations', {
        operation: 'DELETE',
        record_id: recordId,
        md_id: ceoId,
        details: JSON.stringify({
          table: table,
          deleted_data: oldData
        }),
        email: 'ceo@system',
        operation_time: new Date().toISOString()
      });

      return { success: true };

    } catch (error) {
      console.error('💥 CEO Delete operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== CEO DELETE OPERATION COMPLETED =====');
    }
  },

  // CEO-specific: Get company overview
  getCompanyOverview: async () => {
    console.log('🎬 ===== CEO GET COMPANY OVERVIEW STARTED =====');
    
    try {
      const [
        employees,
        departments,
        financialReports,
        strategicGoals
      ] = await Promise.all([
        ceoCrud.getAll('employee'),
        ceoCrud.getAll('departments'),
        ceoCrud.getAll('financialreports'),
        ceoCrud.getAll('strategic_goals')
      ]);

      const overview = {
        totalEmployees: employees.data?.length || 0,
        totalDepartments: departments.data?.length || 0,
        activeEmployees: employees.data?.filter(e => e.status === 'Active')?.length || 0,
        recentFinancialReports: financialReports.data?.slice(-5) || [],
        strategicGoals: strategicGoals.data || [],
        departmentBreakdown: employees.data?.reduce((acc, emp) => {
          acc[emp.department] = (acc[emp.department] || 0) + 1;
          return acc;
        }, {}) || {}
      };

      console.log('✅ Company overview retrieved successfully');
      return { success: true, data: overview };

    } catch (error) {
      console.error('💥 Get company overview failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== CEO GET COMPANY OVERVIEW COMPLETED =====');
    }
  },

  // CEO-specific: Get performance metrics
  getPerformanceMetrics: async () => {
    console.log('🎬 ===== CEO GET PERFORMANCE METRICS STARTED =====');
    
    try {
      const [
        kpiData,
        attendance,
        financialReports,
        employeeFeedback
      ] = await Promise.all([
        ceoCrud.getAll('kpi'),
        ceoCrud.getAll('attendance'),
        ceoCrud.getAll('financialreports'),
        ceoCrud.getAll('employee_feedback')
      ]);

      const metrics = {
        avgKPI: kpiData.data?.reduce((sum, item) => sum + (item.kpivalue || 0), 0) / (kpiData.data?.length || 1) || 0,
        attendanceRate: attendance.data?.filter(a => a.status === 'present')?.length / (attendance.data?.length || 1) * 100 || 0,
        recentProfit: financialReports.data?.slice(-1)[0]?.netprofit || 0,
        avgFeedbackRating: employeeFeedback.data?.reduce((sum, item) => sum + (item.rating || 0), 0) / (employeeFeedback.data?.length || 1) || 0,
        totalRevenue: financialReports.data?.reduce((sum, item) => sum + (item.totalrevenue || 0), 0) || 0
      };

      console.log('✅ Performance metrics retrieved successfully');
      return { success: true, data: metrics };

    } catch (error) {
      console.error('💥 Get performance metrics failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== CEO GET PERFORMANCE METRICS COMPLETED =====');
    }
  },

  // CEO-specific: Approve strategic decisions
  approveStrategicDecision: async (decisionData, ceoId) => {
    console.log('🎬 ===== CEO APPROVE STRATEGIC DECISION STARTED =====');
    
    try {
      // Log the strategic decision approval
      const result = await ceoCrud.create('md_operations', {
        operation: 'STRATEGIC_APPROVAL',
        record_id: decisionData.decisionId,
        md_id: ceoId,
        details: JSON.stringify({
          decision_type: decisionData.type,
          description: decisionData.description,
          impact: decisionData.impact,
          approved_data: decisionData
        }),
        email: 'ceo@system',
        operation_time: new Date().toISOString()
      });

      console.log('✅ Strategic decision approved successfully');
      return result;

    } catch (error) {
      console.error('💥 Approve strategic decision failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== CEO APPROVE STRATEGIC DECISION COMPLETED =====');
    }
  }
};

// CEO table configurations
export const ceoTableConfigs = {
  employee: {
    displayName: 'All Employees',
    columns: ['empid', 'full_name', 'email', 'department', 'role', 'status', 'basicsalary', 'kpiscore'],
    formFields: [
      { name: 'full_name', label: 'Full Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true },
      { name: 'department', label: 'Department', type: 'text', required: true },
      { name: 'role', label: 'Role', type: 'select', options: ['employee', 'manager', 'accountant', 'hr', 'ceo'] },
      { name: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'] },
      { name: 'basicsalary', label: 'Basic Salary', type: 'number' },
      { name: 'kpiscore', label: 'KPI Score', type: 'number' }
    ]
  },
  departments: {
    displayName: 'Departments',
    columns: ['departmentid', 'departmentname', 'description', 'created_at'],
    formFields: [
      { name: 'departmentname', label: 'Department Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' }
    ]
  },
  financialreports: {
    displayName: 'Financial Reports',
    columns: ['reportid', 'quarterenddate', 'totalrevenue', 'totalsalarycost', 'netprofit', 'generated_by'],
    formFields: [
      { name: 'quarterenddate', label: 'Quarter End Date', type: 'date', required: true },
      { name: 'totalrevenue', label: 'Total Revenue', type: 'number', required: true },
      { name: 'totalsalarycost', label: 'Total Salary Cost', type: 'number', required: true },
      { name: 'totalepfcost', label: 'Total EPF Cost', type: 'number' },
      { name: 'totaletfcost', label: 'Total ETF Cost', type: 'number' },
      { name: 'netprofit', label: 'Net Profit', type: 'number', required: true }
    ]
  },
  strategic_goals: {
    displayName: 'Strategic Goals',
    columns: ['goal_id', 'goal_name', 'description', 'year', 'quarter', 'target_value', 'current_value', 'achieved'],
    formFields: [
      { name: 'goal_name', label: 'Goal Name', type: 'text', required: true },
      { name: 'description', label: 'Description', type: 'textarea' },
      { name: 'year', label: 'Year', type: 'number', required: true },
      { name: 'quarter', label: 'Quarter', type: 'number', required: true },
      { name: 'target_value', label: 'Target Value', type: 'number', required: true },
      { name: 'current_value', label: 'Current Value', type: 'number' },
      { name: 'achieved', label: 'Achieved', type: 'switch' }
    ]
  },
  audit_logs: {
    displayName: 'Audit Logs',
    columns: ['logid', 'action', 'table_name', 'email', 'created_at'],
    formFields: [
      { name: 'action', label: 'Action', type: 'text', required: true },
      { name: 'table_name', label: 'Table Name', type: 'text', required: true },
      { name: 'email', label: 'Email', type: 'email', required: true }
    ]
  },
  reports: {
    displayName: 'System Reports',
    columns: ['reportid', 'name', 'type', 'status', 'created_by', 'created_at'],
    formFields: [
      { name: 'name', label: 'Report Name', type: 'text', required: true },
      { name: 'type', label: 'Report Type', type: 'select', options: ['financial', 'hr', 'performance', 'audit'] },
      { name: 'status', label: 'Status', type: 'select', options: ['pending', 'completed', 'failed'] }
    ]
  }
};