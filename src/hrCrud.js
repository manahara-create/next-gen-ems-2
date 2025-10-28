import { supabase } from './supabase';

// HR-specific CRUD operations with comprehensive logging
export const hrCrud = {
  // GET ALL records from HR-related tables
  getAll: async (table, columns = '*', filters = {}) => {
    console.log('🎬 ===== HR GET ALL OPERATION STARTED =====');
    console.log('📋 HR Get All details:', { table, columns, filters });

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
        console.error('❌ HR Get All operation failed:', error);
        throw error;
      }

      console.log('✅ HR Get All operation successful');
      console.log('📦 Retrieved data count:', data?.length);
      return { success: true, data, count };

    } catch (error) {
      console.error('💥 HR Get All operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== HR GET ALL OPERATION COMPLETED =====');
    }
  },

  // CREATE record in HR tables
  create: async (table, data) => {
    console.log('🎬 ===== HR CREATE OPERATION STARTED =====');
    console.log('📋 HR Create details:', { table, data });

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
        console.error('❌ HR Create operation failed:', error);
        throw error;
      }

      console.log('✅ HR Create operation successful');
      console.log('📦 Created data:', result);
      
      // Log the operation in audit_logs
      await hrCrud.create('audit_logs', {
        action: 'CREATE',
        table_name: table,
        recordid: result[0]?.id || result[0]?.empid || result[0]?.attendanceid,
        new_value: JSON.stringify(data),
        email: data.email || 'hr@system',
        ip_address: 'system',
        user_agent: 'hr-dashboard'
      });

      return { success: true, data: result };

    } catch (error) {
      console.error('💥 HR Create operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== HR CREATE OPERATION COMPLETED =====');
    }
  },

  // UPDATE record in HR tables
  update: async (table, recordId, updates, idColumn = 'id') => {
    console.log('🎬 ===== HR UPDATE OPERATION STARTED =====');
    console.log('📋 HR Update details:', { table, recordId, updates, idColumn });

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
        console.error('❌ HR Update operation failed:', error);
        throw error;
      }

      console.log('✅ HR Update operation successful');
      console.log('📦 Updated data:', data);

      // Log the operation in audit_logs
      await hrCrud.create('audit_logs', {
        action: 'UPDATE',
        table_name: table,
        recordid: recordId,
        old_value: JSON.stringify(oldData),
        new_value: JSON.stringify(updates),
        email: updates.email || 'hr@system',
        ip_address: 'system',
        user_agent: 'hr-dashboard'
      });

      return { success: true, data };

    } catch (error) {
      console.error('💥 HR Update operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== HR UPDATE OPERATION COMPLETED =====');
    }
  },

  // DELETE record from HR tables
  delete: async (table, recordId, idColumn = 'id') => {
    console.log('🎬 ===== HR DELETE OPERATION STARTED =====');
    console.log('📋 HR Delete details:', { table, recordId, idColumn });

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
        console.error('❌ HR Delete operation failed:', error);
        throw error;
      }

      console.log('✅ HR Delete operation successful');

      // Log the operation in audit_logs
      await hrCrud.create('audit_logs', {
        action: 'DELETE',
        table_name: table,
        recordid: recordId,
        old_value: JSON.stringify(oldData),
        email: 'hr@system',
        ip_address: 'system',
        user_agent: 'hr-dashboard'
      });

      return { success: true };

    } catch (error) {
      console.error('💥 HR Delete operation failed completely:', error);
      return { success: false, error: error.message };
    } finally {
      console.log('🏁 ===== HR DELETE OPERATION COMPLETED =====');
    }
  },

  // Special HR functions
  updateEmployeeKPI: async (empid, kpiData) => {
    console.log('📊 Updating employee KPI:', { empid, kpiData });
    
    try {
      // First, update or create KPI record
      const kpiResult = await hrCrud.create('kpi', {
        empid: empid,
        kpivalue: kpiData.kpivalue,
        calculatedate: kpiData.calculatedate || new Date().toISOString().split('T')[0],
        kpiyear: kpiData.kpiyear || new Date().getFullYear(),
        email: kpiData.email
      });

      // Then update employee's kpiscore
      const employeeResult = await hrCrud.update('employee', empid, {
        kpiscore: kpiData.kpivalue,
        updated_at: new Date().toISOString()
      }, 'empid');

      return { 
        success: true, 
        kpi: kpiResult.data, 
        employee: employeeResult.data 
      };

    } catch (error) {
      console.error('💥 KPI update failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Get employee performance summary
  getEmployeePerformance: async (empid) => {
    console.log('📈 Getting employee performance:', empid);
    
    try {
      const [kpi, attendance, feedback] = await Promise.all([
        hrCrud.getAll('kpi', '*', { empid: empid }),
        hrCrud.getAll('attendance', '*', { empid: empid }),
        hrCrud.getAll('employee_feedback', '*', { empid: empid })
      ]);

      return {
        success: true,
        data: {
          kpi: kpi.data,
          attendance: attendance.data,
          feedback: feedback.data
        }
      };

    } catch (error) {
      console.error('💥 Performance data fetch failed:', error);
      return { success: false, error: error.message };
    }
  },

  // Generate HR report
  generateHRReport: async (reportConfig) => {
    console.log('📋 Generating HR report:', reportConfig);
    
    try {
      const { data, error } = await supabase
        .from('hr_reports')
        .insert([{
          report_name: reportConfig.name,
          report_type: reportConfig.type,
          generated_by: reportConfig.generated_by,
          file_path: reportConfig.file_path,
          status: 'completed',
          email: reportConfig.email || 'hr@system',
          report_date: new Date().toISOString()
        }])
        .select();

      if (error) {
        console.error('❌ HR report generation failed:', error);
        throw error;
      }

      console.log('✅ HR report generated successfully');
      return { success: true, data };

    } catch (error) {
      console.error('💥 HR report generation failed completely:', error);
      return { success: false, error: error.message };
    }
  }
};