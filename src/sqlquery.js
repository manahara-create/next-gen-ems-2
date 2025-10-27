import supabase from "./supabase";

export const createAccountantOperation = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('accountant_operations')
            .insert([{
                operation: data.operation || null,
                record_id: data.record_id || null,
                accountant_id: data.accountant_id || null,
                details: data.details || null,
                operation_time: data.operation_time || new Date().toISOString()
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAccountantOperationById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('accountant_operations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllAccountantOperations = async (filters = {}) => {
    try {
        let query = supabase.from('accountant_operations').select('*');

        if (filters.accountant_id) query = query.eq('accountant_id', filters.accountant_id);
        if (filters.operation) query = query.eq('operation', filters.operation);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateAccountantOperation = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('accountant_operations')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteAccountantOperation = async (id) => {
    try {
        const { error } = await supabase
            .from('accountant_operations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'Operation deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== ATTENDANCE ====================

export const createAttendance = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('attendance')
            .insert([{
                empid: data.empid || null,
                date: data.date || new Date().toISOString(),
                intime: data.intime || null,
                outtime: data.outtime || null,
                status: data.status || 'Present'
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAttendanceById = async (attendanceid) => {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .select('*')
            .eq('attendanceid', attendanceid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllAttendance = async (filters = {}) => {
    try {
        let query = supabase.from('attendance').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.date) query = query.eq('date', filters.date);
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateAttendance = async (attendanceid, updates) => {
    try {
        const { data, error } = await supabase
            .from('attendance')
            .update(updates)
            .eq('attendanceid', attendanceid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteAttendance = async (attendanceid) => {
    try {
        const { error } = await supabase
            .from('attendance')
            .delete()
            .eq('attendanceid', attendanceid);

        if (error) throw error;
        return { success: true, message: 'Attendance deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== AUDIT LOGS ====================

export const createAuditLog = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('audit_logs')
            .insert([{
                userid: data.userid || null,
                action: data.action || null,
                table_name: data.table_name || null,
                recordid: data.recordid || null,
                old_value: data.old_value || null,
                new_value: data.new_value || null,
                ip_address: data.ip_address || null,
                user_agent: data.user_agent || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAuditLogById = async (logid) => {
    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .select('*')
            .eq('logid', logid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllAuditLogs = async (filters = {}) => {
    try {
        let query = supabase.from('audit_logs').select('*');

        if (filters.userid) query = query.eq('userid', filters.userid);
        if (filters.action) query = query.eq('action', filters.action);
        if (filters.table_name) query = query.eq('table_name', filters.table_name);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateAuditLog = async (logid, updates) => {
    try {
        const { data, error } = await supabase
            .from('audit_logs')
            .update(updates)
            .eq('logid', logid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteAuditLog = async (logid) => {
    try {
        const { error } = await supabase
            .from('audit_logs')
            .delete()
            .eq('logid', logid);

        if (error) throw error;
        return { success: true, message: 'Audit log deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== AUTH USERS ====================

export const createAuthUser = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('auth_users')
            .insert([{
                email: data.email || null,
                role: data.role || 'employee',
                is_active: data.is_active !== undefined ? data.is_active : true,
                full_name: data.full_name || null,
                supabase_auth_id: data.supabase_auth_id || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAuthUserById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('auth_users')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllAuthUsers = async (filters = {}) => {
    try {
        let query = supabase.from('auth_users').select('*');

        if (filters.role) query = query.eq('role', filters.role);
        if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
        if (filters.email) query = query.eq('email', filters.email);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateAuthUser = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('auth_users')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteAuthUser = async (id) => {
    try {
        const { error } = await supabase
            .from('auth_users')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'Auth user deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== BONUS ====================

export const createBonus = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('bonus')
            .insert([{
                empid: data.empid || null,
                type: data.type || null,
                reason: data.reason || null,
                amount: data.amount || 0,
                bonusdate: data.bonusdate || new Date().toISOString().split('T')[0],
                processedby: data.processedby || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getBonusById = async (bonusid) => {
    try {
        const { data, error } = await supabase
            .from('bonus')
            .select('*')
            .eq('bonusid', bonusid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllBonuses = async (filters = {}) => {
    try {
        let query = supabase.from('bonus').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.type) query = query.eq('type', filters.type);
        if (filters.bonusdate) query = query.eq('bonusdate', filters.bonusdate);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateBonus = async (bonusid, updates) => {
    try {
        const { data, error } = await supabase
            .from('bonus')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('bonusid', bonusid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteBonus = async (bonusid) => {
    try {
        const { error } = await supabase
            .from('bonus')
            .delete()
            .eq('bonusid', bonusid);

        if (error) throw error;
        return { success: true, message: 'Bonus deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== DEPARTMENTS ====================

export const createDepartment = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('departments')
            .insert([{
                departmentname: data.departmentname || null,
                description: data.description || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getDepartmentById = async (departmentid) => {
    try {
        const { data, error } = await supabase
            .from('departments')
            .select('*')
            .eq('departmentid', departmentid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllDepartments = async (filters = {}) => {
    try {
        let query = supabase.from('departments').select('*');

        if (filters.departmentname) query = query.ilike('departmentname', `%${filters.departmentname}%`);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateDepartment = async (departmentid, updates) => {
    try {
        const { data, error } = await supabase
            .from('departments')
            .update(updates)
            .eq('departmentid', departmentid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteDepartment = async (departmentid) => {
    try {
        const { error } = await supabase
            .from('departments')
            .delete()
            .eq('departmentid', departmentid);

        if (error) throw error;
        return { success: true, message: 'Department deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== EMPLOYEE ====================

export const createEmployee = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('employee')
            .insert([{
                full_name: data.full_name || null,
                email: data.email || null,
                phone: data.phone || null,
                role: data.role || 'employee',
                department: data.department || 'AUTOMOTIVE',
                gender: data.gender || null,
                empaddress: data.empaddress || null,
                status: data.status || 'Active',
                is_active: data.is_active !== undefined ? data.is_active : true,
                managerid: data.managerid || null,
                basicsalary: data.basicsalary || 0,
                kpiscore: data.kpiscore || null,
                satisfaction_score: data.satisfaction_score || null,
                dob: data.dob || null,
                tenure: data.tenure || null,
                auth_user_id: data.auth_user_id || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getEmployeeById = async (empid) => {
    try {
        const { data, error } = await supabase
            .from('employee')
            .select('*')
            .eq('empid', empid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllEmployees = async (filters = {}) => {
    try {
        let query = supabase.from('employee').select('*');

        if (filters.department) query = query.eq('department', filters.department);
        if (filters.role) query = query.eq('role', filters.role);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);
        if (filters.managerid) query = query.eq('managerid', filters.managerid);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateEmployee = async (empid, updates) => {
    try {
        const { data, error } = await supabase
            .from('employee')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('empid', empid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteEmployee = async (empid) => {
    try {
        const { error } = await supabase
            .from('employee')
            .delete()
            .eq('empid', empid);

        if (error) throw error;
        return { success: true, message: 'Employee deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== EMPLOYEE DOCUMENTS ====================

export const createEmployeeDocument = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('employee_documents')
            .insert([{
                empid: data.empid || null,
                document_name: data.document_name || null,
                document_type: data.document_type || null,
                file_path: data.file_path || null,
                file_size: data.file_size || null,
                is_verified: data.is_verified !== undefined ? data.is_verified : false
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getEmployeeDocumentById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('employee_documents')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllEmployeeDocuments = async (filters = {}) => {
    try {
        let query = supabase.from('employee_documents').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.document_type) query = query.eq('document_type', filters.document_type);
        if (filters.is_verified !== undefined) query = query.eq('is_verified', filters.is_verified);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateEmployeeDocument = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('employee_documents')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteEmployeeDocument = async (id) => {
    try {
        const { error } = await supabase
            .from('employee_documents')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'Employee document deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== EMPLOYEE FEEDBACK ====================

export const createEmployeeFeedback = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('employee_feedback')
            .insert([{
                empid: data.empid || null,
                feedback_type: data.feedback_type || null,
                subject: data.subject || null,
                message: data.message || null,
                rating: data.rating || null,
                status: data.status || 'submitted'
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getEmployeeFeedbackById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('employee_feedback')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllEmployeeFeedback = async (filters = {}) => {
    try {
        let query = supabase.from('employee_feedback').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.feedback_type) query = query.eq('feedback_type', filters.feedback_type);
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateEmployeeFeedback = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('employee_feedback')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteEmployeeFeedback = async (id) => {
    try {
        const { error } = await supabase
            .from('employee_feedback')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'Employee feedback deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== EMPLOYEE LEAVE ====================

export const createEmployeeLeave = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('employeeleave')
            .insert([{
                empid: data.empid || null,
                leavetypeid: data.leavetypeid || null,
                leavefromdate: data.leavefromdate || null,
                leavetodate: data.leavetodate || null,
                duration: data.duration || null,
                leavereason: data.leavereason || null,
                leavestatus: data.leavestatus || 'pending',
                approvedby: data.approvedby || null,
                remarks: data.remarks || null,
                leavetype: data.leavetype || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getEmployeeLeaveById = async (leaveid) => {
    try {
        const { data, error } = await supabase
            .from('employeeleave')
            .select('*')
            .eq('leaveid', leaveid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllEmployeeLeaves = async (filters = {}) => {
    try {
        let query = supabase.from('employeeleave').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.leavestatus) query = query.eq('leavestatus', filters.leavestatus);
        if (filters.leavetype) query = query.eq('leavetype', filters.leavetype);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateEmployeeLeave = async (leaveid, updates) => {
    try {
        const { data, error } = await supabase
            .from('employeeleave')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('leaveid', leaveid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteEmployeeLeave = async (leaveid) => {
    try {
        const { error } = await supabase
            .from('employeeleave')
            .delete()
            .eq('leaveid', leaveid);

        if (error) throw error;
        return { success: true, message: 'Employee leave deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== EMPLOYEE TRAINING ====================

export const createEmployeeTraining = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('employeetraining')
            .insert([{
                trainingid: data.trainingid || null,
                empid: data.empid || null,
                starttime: data.starttime || null,
                endtime: data.endtime || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getEmployeeTrainingById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('employeetraining')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllEmployeeTrainings = async (filters = {}) => {
    try {
        let query = supabase.from('employeetraining').select('*');

        if (filters.trainingid) query = query.eq('trainingid', filters.trainingid);
        if (filters.empid) query = query.eq('empid', filters.empid);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateEmployeeTraining = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('employeetraining')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteEmployeeTraining = async (id) => {
    try {
        const { error } = await supabase
            .from('employeetraining')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'Employee training deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== EPF CONTRIBUTIONS ====================

export const createEpfContribution = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('epf_contributions')
            .insert([{
                empid: data.empid || null,
                basicsalary: data.basicsalary || 0,
                employeecontribution: data.employeecontribution || 0,
                employercontribution: data.employercontribution || 0,
                totalcontribution: data.totalcontribution || 0,
                month: data.month || null,
                processed_by: data.processed_by || null,
                status: data.status || 'pending'
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getEpfContributionById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('epf_contributions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllEpfContributions = async (filters = {}) => {
    try {
        let query = supabase.from('epf_contributions').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.month) query = query.eq('month', filters.month);
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateEpfContribution = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('epf_contributions')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteEpfContribution = async (id) => {
    try {
        const { error } = await supabase
            .from('epf_contributions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'EPF contribution deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== EPFNETF ====================

export const createEpfNetf = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('epfnetf')
            .insert([{
                empid: data.empid || null,
                basicsalary: data.basicsalary || 0,
                epfcalculation: data.epfcalculation || 0,
                etfcalculation: data.etfcalculation || 0,
                applieddate: data.applieddate || new Date().toISOString().split('T')[0],
                processedby: data.processedby || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getEpfNetfById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('epfnetf')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllEpfNetf = async (filters = {}) => {
    try {
        let query = supabase.from('epfnetf').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.applieddate) query = query.eq('applieddate', filters.applieddate);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateEpfNetf = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('epfnetf')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteEpfNetf = async (id) => {
    try {
        const { error } = await supabase
            .from('epfnetf')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'EPFNETF deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== ETF CONTRIBUTIONS ====================

export const createEtfContribution = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('etf_contributions')
            .insert([{
                empid: data.empid || null,
                basicsalary: data.basicsalary || 0,
                employercontribution: data.employercontribution || 0,
                month: data.month || null,
                processed_by: data.processed_by || null,
                status: data.status || 'pending'
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getEtfContributionById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('etf_contributions')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllEtfContributions = async (filters = {}) => {
    try {
        let query = supabase.from('etf_contributions').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.month) query = query.eq('month', filters.month);
        if (filters.status) query = query.eq('status', filters.status);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateEtfContribution = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('etf_contributions')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteEtfContribution = async (id) => {
    try {
        const { error } = await supabase
            .from('etf_contributions')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'ETF contribution deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== FINANCIAL REPORTS ====================

export const createFinancialReport = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('financialreports')
            .insert([{
                quarterenddate: data.quarterenddate || null,
                totalrevenue: data.totalrevenue || 0,
                totalsalarycost: data.totalsalarycost || 0,
                totalepfcost: data.totalepfcost || 0,
                totaletfcost: data.totaletfcost || 0,
                totalbonuscost: data.totalbonuscost || 0,
                totalotcost: data.totalotcost || 0,
                netprofit: data.netprofit || 0,
                generated_by: data.generated_by || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getFinancialReportById = async (reportid) => {
    try {
        const { data, error } = await supabase
            .from('financialreports')
            .select('*')
            .eq('reportid', reportid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllFinancialReports = async (filters = {}) => {
    try {
        let query = supabase.from('financialreports').select('*');

        if (filters.quarterenddate) query = query.eq('quarterenddate', filters.quarterenddate);
        if (filters.generated_by) query = query.eq('generated_by', filters.generated_by);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateFinancialReport = async (reportid, updates) => {
    try {
        const { data, error } = await supabase
            .from('financialreports')
            .update(updates)
            .eq('reportid', reportid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteFinancialReport = async (reportid) => {
    try {
        const { error } = await supabase
            .from('financialreports')
            .delete()
            .eq('reportid', reportid);

        if (error) throw error;
        return { success: true, message: 'Financial report deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== HR OPERATIONS ====================

export const createHrOperation = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('hr_operations')
            .insert([{
                operation_type: data.operation_type || null,
                performed_by: data.performed_by || null,
                target_employee: data.target_employee || null,
                details: data.details || null,
                operation: data.operation || null,
                hr_id: data.hr_id || null,
                target_employee_id: data.target_employee_id || null,
                record_id: data.record_id || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getHrOperationById = async (operationid) => {
    try {
        const { data, error } = await supabase
            .from('hr_operations')
            .select('*')
            .eq('operationid', operationid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllHrOperations = async (filters = {}) => {
    try {
        let query = supabase.from('hr_operations').select('*');

        if (filters.operation_type) query = query.eq('operation_type', filters.operation_type);
        if (filters.hr_id) query = query.eq('hr_id', filters.hr_id);
        if (filters.target_employee_id) query = query.eq('target_employee_id', filters.target_employee_id);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateHrOperation = async (operationid, updates) => {
    try {
        const { data, error } = await supabase
            .from('hr_operations')
            .update(updates)
            .eq('operationid', operationid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteHrOperation = async (operationid) => {
    try {
        const { error } = await supabase
            .from('hr_operations')
            .delete()
            .eq('operationid', operationid);

        if (error) throw error;
        return { success: true, message: 'HR operation deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== HR REPORTS ====================

export const createHrReport = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('hr_reports')
            .insert([{
                report_name: data.report_name || null,
                report_type: data.report_type || null,
                generated_by: data.generated_by || null,
                file_path: data.file_path || null,
                status: data.status || 'completed'
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getHrReportById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('hr_reports')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllHrReports = async (filters = {}) => {
    try {
        let query = supabase.from('hr_reports').select('*');

        if (filters.report_type) query = query.eq('report_type', filters.report_type);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.generated_by) query = query.eq('generated_by', filters.generated_by);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateHrReport = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('hr_reports')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteHrReport = async (id) => {
    try {
        const { error } = await supabase
            .from('hr_reports')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'HR report deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== INCREMENT ====================

export const createIncrement = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('increment')
            .insert([{
                empid: data.empid || null,
                percentage: data.percentage || 0,
                amount: data.amount || 0,
                lastincrementdate: data.lastincrementdate || null,
                nextincrementdate: data.nextincrementdate || null,
                approval: data.approval || 'pending',
                processed_by: data.processed_by || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getIncrementById = async (incrementid) => {
    try {
        const { data, error } = await supabase
            .from('increment')
            .select('*')
            .eq('incrementid', incrementid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllIncrements = async (filters = {}) => {
    try {
        let query = supabase.from('increment').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.approval) query = query.eq('approval', filters.approval);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateIncrement = async (incrementid, updates) => {
    try {
        const { data, error } = await supabase
            .from('increment')
            .update(updates)
            .eq('incrementid', incrementid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteIncrement = async (incrementid) => {
    try {
        const { error } = await supabase
            .from('increment')
            .delete()
            .eq('incrementid', incrementid);

        if (error) throw error;
        return { success: true, message: 'Increment deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== KPI ====================

export const createKpi = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('kpi')
            .insert([{
                empid: data.empid || null,
                kpivalue: data.kpivalue || 0,
                calculatedate: data.calculatedate || new Date().toISOString().split('T')[0],
                kpiyear: data.kpiyear || new Date().getFullYear(),
                kpirankingid: data.kpirankingid || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getKpiById = async (kpiid) => {
    try {
        const { data, error } = await supabase
            .from('kpi')
            .select('*')
            .eq('kpiid', kpiid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllKpis = async (filters = {}) => {
    try {
        let query = supabase.from('kpi').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.kpiyear) query = query.eq('kpiyear', filters.kpiyear);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateKpi = async (kpiid, updates) => {
    try {
        const { data, error } = await supabase
            .from('kpi')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('kpiid', kpiid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteKpi = async (kpiid) => {
    try {
        const { error } = await supabase
            .from('kpi')
            .delete()
            .eq('kpiid', kpiid);

        if (error) throw error;
        return { success: true, message: 'KPI deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== KPI CATEGORIES ====================

export const createKpiCategory = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('kpi_categories')
            .insert([{
                category_name: data.category_name || null,
                description: data.description || null,
                weight: data.weight || 1,
                is_active: data.is_active !== undefined ? data.is_active : true
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getKpiCategoryById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('kpi_categories')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllKpiCategories = async (filters = {}) => {
    try {
        let query = supabase.from('kpi_categories').select('*');

        if (filters.is_active !== undefined) query = query.eq('is_active', filters.is_active);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateKpiCategory = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('kpi_categories')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteKpiCategory = async (id) => {
    try {
        const { error } = await supabase
            .from('kpi_categories')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'KPI category deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== KPI DETAILS ====================

export const createKpiDetail = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('kpi_details')
            .insert([{
                kpiid: data.kpiid || null,
                category_id: data.category_id || null,
                score: data.score || 0,
                comments: data.comments || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getKpiDetailById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('kpi_details')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllKpiDetails = async (filters = {}) => {
    try {
        let query = supabase.from('kpi_details').select('*');

        if (filters.kpiid) query = query.eq('kpiid', filters.kpiid);
        if (filters.category_id) query = query.eq('category_id', filters.category_id);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateKpiDetail = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('kpi_details')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteKpiDetail = async (id) => {
    try {
        const { error } = await supabase
            .from('kpi_details')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'KPI detail deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== KPI RANKING ====================

export const createKpiRanking = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('kpiranking')
            .insert([{
                kpirank: data.kpirank || null,
                min_value: data.min_value || 0,
                max_value: data.max_value || 0
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getKpiRankingById = async (kpirankingid) => {
    try {
        const { data, error } = await supabase
            .from('kpiranking')
            .select('*')
            .eq('kpirankingid', kpirankingid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllKpiRankings = async () => {
    try {
        const { data, error } = await supabase.from('kpiranking').select('*');
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateKpiRanking = async (kpirankingid, updates) => {
    try {
        const { data, error } = await supabase
            .from('kpiranking')
            .update(updates)
            .eq('kpirankingid', kpirankingid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteKpiRanking = async (kpirankingid) => {
    try {
        const { error } = await supabase
            .from('kpiranking')
            .delete()
            .eq('kpirankingid', kpirankingid);

        if (error) throw error;
        return { success: true, message: 'KPI ranking deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== LEAVE BALANCE ====================

export const createLeaveBalance = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('leavebalance')
            .insert([{
                empid: data.empid || null,
                leavetypeid: data.leavetypeid || null,
                year: data.year || new Date().getFullYear(),
                days: data.days || 0
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getLeaveBalanceById = async (balanceid) => {
    try {
        const { data, error } = await supabase
            .from('leavebalance')
            .select('*')
            .eq('balanceid', balanceid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllLeaveBalances = async (filters = {}) => {
    try {
        let query = supabase.from('leavebalance').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.year) query = query.eq('year', filters.year);
        if (filters.leavetypeid) query = query.eq('leavetypeid', filters.leavetypeid);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateLeaveBalance = async (balanceid, updates) => {
    try {
        const { data, error } = await supabase
            .from('leavebalance')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('balanceid', balanceid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteLeaveBalance = async (balanceid) => {
    try {
        const { error } = await supabase
            .from('leavebalance')
            .delete()
            .eq('balanceid', balanceid);

        if (error) throw error;
        return { success: true, message: 'Leave balance deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== LEAVE TYPE ====================

export const createLeaveType = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('leavetype')
            .insert([{
                leavetype: data.leavetype || null,
                description: data.description || null,
                max_days: data.max_days || 0
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getLeaveTypeById = async (leavetypeid) => {
    try {
        const { data, error } = await supabase
            .from('leavetype')
            .select('*')
            .eq('leavetypeid', leavetypeid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllLeaveTypes = async () => {
    try {
        const { data, error } = await supabase.from('leavetype').select('*');
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateLeaveType = async (leavetypeid, updates) => {
    try {
        const { data, error } = await supabase
            .from('leavetype')
            .update(updates)
            .eq('leavetypeid', leavetypeid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteLeaveType = async (leavetypeid) => {
    try {
        const { error } = await supabase
            .from('leavetype')
            .delete()
            .eq('leavetypeid', leavetypeid);

        if (error) throw error;
        return { success: true, message: 'Leave type deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== LOAN REQUEST ====================

export const createLoanRequest = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('loanrequest')
            .insert([{
                empid: data.empid || null,
                loantypeid: data.loantypeid || null,
                amount: data.amount || 0,
                duration: data.duration || 0,
                interestrate: data.interestrate || 0,
                date: data.date || new Date().toISOString().split('T')[0],
                status: data.status || 'pending',
                processedby: data.processedby || null,
                processedat: data.processedat || null,
                remarks: data.remarks || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getLoanRequestById = async (loanrequestid) => {
    try {
        const { data, error } = await supabase
            .from('loanrequest')
            .select('*')
            .eq('loanrequestid', loanrequestid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllLoanRequests = async (filters = {}) => {
    try {
        let query = supabase.from('loanrequest').select('*');

        if (filters.empid) query = query.eq('empid', filters.empid);
        if (filters.status) query = query.eq('status', filters.status);
        if (filters.loantypeid) query = query.eq('loantypeid', filters.loantypeid);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateLoanRequest = async (loanrequestid, updates) => {
    try {
        const { data, error } = await supabase
            .from('loanrequest')
            .update({ ...updates, updated_at: new Date().toISOString() })
            .eq('loanrequestid', loanrequestid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteLoanRequest = async (loanrequestid) => {
    try {
        const { error } = await supabase
            .from('loanrequest')
            .delete()
            .eq('loanrequestid', loanrequestid);

        if (error) throw error;
        return { success: true, message: 'Loan request deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== LOAN TYPE ====================

export const createLoanType = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('loantype')
            .insert([{
                loantype: data.loantype || null,
                description: data.description || null,
                max_amount: data.max_amount || 0,
                max_duration: data.max_duration || 0,
                interest_rate: data.interest_rate || 0,
                max_amount_multiplier: data.max_amount_multiplier || 3.0,
                min_salary_requirement: data.min_salary_requirement || 25000
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getLoanTypeById = async (loantypeid) => {
    try {
        const { data, error } = await supabase
            .from('loantype')
            .select('*')
            .eq('loantypeid', loantypeid)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllLoanTypes = async () => {
    try {
        const { data, error } = await supabase.from('loantype').select('*');
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateLoanType = async (loantypeid, updates) => {
    try {
        const { data, error } = await supabase
            .from('loantype')
            .update(updates)
            .eq('loantypeid', loantypeid)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteLoanType = async (loantypeid) => {
    try {
        const { error } = await supabase
            .from('loantype')
            .delete()
            .eq('loantypeid', loantypeid);

        if (error) throw error;
        return { success: true, message: 'Loan type deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== MANAGER NOTES ====================

export const createManagerNote = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('manager_notes')
            .insert([{
                manager_id: data.manager_id || null,
                empid: data.empid || null,
                note: data.note || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getManagerNoteById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('manager_notes')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllManagerNotes = async (filters = {}) => {
    try {
        let query = supabase.from('manager_notes').select('*');

        if (filters.manager_id) query = query.eq('manager_id', filters.manager_id);
        if (filters.empid) query = query.eq('empid', filters.empid);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateManagerNote = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('manager_notes')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteManagerNote = async (id) => {
    try {
        const { error } = await supabase
            .from('manager_notes')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'Manager note deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== MANAGER OPERATIONS ====================

export const createManagerOperation = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('manager_operations')
            .insert([{
                operation: data.operation || null,
                record_id: data.record_id || null,
                manager_id: data.manager_id || null,
                details: data.details || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getManagerOperationById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('manager_operations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllManagerOperations = async (filters = {}) => {
    try {
        let query = supabase.from('manager_operations').select('*');

        if (filters.manager_id) query = query.eq('manager_id', filters.manager_id);
        if (filters.operation) query = query.eq('operation', filters.operation);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateManagerOperation = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('manager_operations')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteManagerOperation = async (id) => {
    try {
        const { error } = await supabase
            .from('manager_operations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'Manager operation deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// ==================== MD OPERATIONS ====================

export const createMdOperation = async (data) => {
    try {
        const { data: result, error } = await supabase
            .from('md_operations')
            .insert([{
                operation: data.operation || null,
                record_id: data.record_id || null,
                md_id: data.md_id || null,
                details: data.details || null
            }])
            .select();

        if (error) throw error;
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getMdOperationById = async (id) => {
    try {
        const { data, error } = await supabase
            .from('md_operations')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const getAllMdOperations = async (filters = {}) => {
    try {
        let query = supabase.from('md_operations').select('*');

        if (filters.md_id) query = query.eq('md_id', filters.md_id);
        if (filters.operation) query = query.eq('operation', filters.operation);

        const { data, error } = await query;
        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const updateMdOperation = async (id, updates) => {
    try {
        const { data, error } = await supabase
            .from('md_operations')
            .update(updates)
            .eq('id', id)
            .select();

        if (error) throw error;
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

export const deleteMdOperation = async (id) => {
    try {
        const { error } = await supabase
            .from('md_operations')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return { success: true, message: 'MD operation deleted successfully' };
    } catch (error) {
        return { success: false, error: error.message };
    }
};

// Create a meeting
export const createMeeting = async (meetingData) => {
    try {
        const defaultData = {
            status: 'scheduled',
            created_at: new Date(),
            ...meetingData
        }

        const { data, error } = await supabase
            .from('meeting')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating meeting:', error)
        return { data: null, error }
    }
}

// Get meeting by ID
export const getMeetingById = async (meetingId) => {
    try {
        const { data, error } = await supabase
            .from('meeting')
            .select('*')
            .eq('meetingid', meetingId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting meeting:', error)
        return { data: null, error }
    }
}

// Get all meetings
export const getAllMeetings = async (filters = {}) => {
    try {
        let query = supabase.from('meeting').select('*')

        // Apply filters if provided
        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting meetings:', error)
        return { data: null, error }
    }
}

// Update a meeting
export const updateMeeting = async (meetingId, updateData) => {
    try {
        const { data, error } = await supabase
            .from('meeting')
            .update(updateData)
            .eq('meetingid', meetingId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating meeting:', error)
        return { data: null, error }
    }
}

// Delete a meeting
export const deleteMeeting = async (meetingId) => {
    try {
        const { data, error } = await supabase
            .from('meeting')
            .delete()
            .eq('meetingid', meetingId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting meeting:', error)
        return { data: null, error }
    }
}

// Create OT record
export const createOT = async (otData) => {
    try {
        const defaultData = {
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
            ...otData
        }

        const { data, error } = await supabase
            .from('ot')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating OT record:', error)
        return { data: null, error }
    }
}

// Get OT by ID
export const getOTById = async (otId) => {
    try {
        const { data, error } = await supabase
            .from('ot')
            .select('*')
            .eq('otid', otId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting OT record:', error)
        return { data: null, error }
    }
}

// Get all OT records
export const getAllOT = async (filters = {}) => {
    try {
        let query = supabase.from('ot').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting OT records:', error)
        return { data: null, error }
    }
}

// Update OT record
export const updateOT = async (otId, updateData) => {
    try {
        const dataToUpdate = {
            ...updateData,
            updated_at: new Date()
        }

        const { data, error } = await supabase
            .from('ot')
            .update(dataToUpdate)
            .eq('otid', otId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating OT record:', error)
        return { data: null, error }
    }
}

// Delete OT record
export const deleteOT = async (otId) => {
    try {
        const { data, error } = await supabase
            .from('ot')
            .delete()
            .eq('otid', otId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting OT record:', error)
        return { data: null, error }
    }
}

// Create performance rating
export const createPerformanceRating = async (ratingData) => {
    try {
        const defaultData = {
            rating_date: new Date(),
            created_at: new Date(),
            ...ratingData
        }

        const { data, error } = await supabase
            .from('performance_rating')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating performance rating:', error)
        return { data: null, error }
    }
}

// Get performance rating by ID
export const getPerformanceRatingById = async (ratingId) => {
    try {
        const { data, error } = await supabase
            .from('performance_rating')
            .select('*')
            .eq('ratingid', ratingId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting performance rating:', error)
        return { data: null, error }
    }
}

// Get all performance ratings
export const getAllPerformanceRatings = async (filters = {}) => {
    try {
        let query = supabase.from('performance_rating').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting performance ratings:', error)
        return { data: null, error }
    }
}

// Update performance rating
export const updatePerformanceRating = async (ratingId, updateData) => {
    try {
        const { data, error } = await supabase
            .from('performance_rating')
            .update(updateData)
            .eq('ratingid', ratingId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating performance rating:', error)
        return { data: null, error }
    }
}

// Delete performance rating
export const deletePerformanceRating = async (ratingId) => {
    try {
        const { data, error } = await supabase
            .from('performance_rating')
            .delete()
            .eq('ratingid', ratingId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting performance rating:', error)
        return { data: null, error }
    }
}

// Create position history
export const createPositionHistory = async (positionData) => {
    try {
        const defaultData = {
            is_current: false,
            created_at: new Date(),
            ...positionData
        }

        const { data, error } = await supabase
            .from('position_history')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating position history:', error)
        return { data: null, error }
    }
}

// Get position history by ID
export const getPositionHistoryById = async (historyId) => {
    try {
        const { data, error } = await supabase
            .from('position_history')
            .select('*')
            .eq('id', historyId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting position history:', error)
        return { data: null, error }
    }
}

// Get all position histories
export const getAllPositionHistories = async (filters = {}) => {
    try {
        let query = supabase.from('position_history').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting position histories:', error)
        return { data: null, error }
    }
}

// Update position history
export const updatePositionHistory = async (historyId, updateData) => {
    try {
        const { data, error } = await supabase
            .from('position_history')
            .update(updateData)
            .eq('id', historyId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating position history:', error)
        return { data: null, error }
    }
}

// Delete position history
export const deletePositionHistory = async (historyId) => {
    try {
        const { data, error } = await supabase
            .from('position_history')
            .delete()
            .eq('id', historyId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting position history:', error)
        return { data: null, error }
    }
}

// Create salary record
export const createSalary = async (salaryData) => {
    try {
        const defaultData = {
            basicsalary: 0,
            otpay: 0,
            bonuspay: 0,
            incrementpay: 0,
            totalsalary: 0,
            created_at: new Date(),
            updated_at: new Date(),
            ...salaryData
        }

        // Calculate total salary if not provided
        if (!salaryData.totalsalary) {
            defaultData.totalsalary =
                (defaultData.basicsalary || 0) +
                (defaultData.otpay || 0) +
                (defaultData.bonuspay || 0) +
                (defaultData.incrementpay || 0)
        }

        const { data, error } = await supabase
            .from('salary')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating salary record:', error)
        return { data: null, error }
    }
}

// Get salary by ID
export const getSalaryById = async (salaryId) => {
    try {
        const { data, error } = await supabase
            .from('salary')
            .select('*')
            .eq('salaryid', salaryId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting salary record:', error)
        return { data: null, error }
    }
}

// Get all salary records
export const getAllSalaries = async (filters = {}) => {
    try {
        let query = supabase.from('salary').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting salary records:', error)
        return { data: null, error }
    }
}

// Update salary record
export const updateSalary = async (salaryId, updateData) => {
    try {
        const dataToUpdate = {
            ...updateData,
            updated_at: new Date()
        }

        // Recalculate total salary if any component is updated
        if (updateData.basicsalary || updateData.otpay || updateData.bonuspay || updateData.incrementpay) {
            const { data: currentSalary } = await getSalaryById(salaryId)
            if (currentSalary) {
                dataToUpdate.totalsalary =
                    (updateData.basicsalary || currentSalary.basicsalary) +
                    (updateData.otpay || currentSalary.otpay) +
                    (updateData.bonuspay || currentSalary.bonuspay) +
                    (updateData.incrementpay || currentSalary.incrementpay)
            }
        }

        const { data, error } = await supabase
            .from('salary')
            .update(dataToUpdate)
            .eq('salaryid', salaryId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating salary record:', error)
        return { data: null, error }
    }
}

// Delete salary record
export const deleteSalary = async (salaryId) => {
    try {
        const { data, error } = await supabase
            .from('salary')
            .delete()
            .eq('salaryid', salaryId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting salary record:', error)
        return { data: null, error }
    }
}

// Example usage
async function exampleUsage() {
    // Create a meeting
    const newMeeting = await createMeeting({
        topic: 'Project Kickoff',
        description: 'Initial project discussion',
        date: '2024-01-15',
        starttime: '09:00',
        endtime: '10:00',
        location: 'Conference Room A',
        type: 'project',
        empid: '123e4567-e89b-12d3-a456-426614174000'
    })

    // Get all pending OT records
    const pendingOT = await getAllOT({ status: 'pending' })

    // Update a salary record
    const updatedSalary = await updateSalary('salary-uuid-here', {
        bonuspay: 1000,
        totalsalary: 6000
    })

    // Get performance ratings for an employee
    const employeeRatings = await getAllPerformanceRatings({
        empid: 'employee-uuid-here'
    })
}

// Error handling example
async function safeOperation() {
    const { data, error } = await createMeeting(meetingData)

    if (error) {
        console.error('Operation failed:', error.message)
        // Handle error appropriately
        return
    }

    console.log('Operation successful:', data)
    // Proceed with the data
}

// Create position
export const createPosition = async (positionData) => {
    try {
        const defaultData = {
            status: 'open',
            created_at: new Date(),
            updated_at: new Date(),
            ...positionData
        }

        const { data, error } = await supabase
            .from('positions')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating position:', error)
        return { data: null, error }
    }
}

// Get position by ID
export const getPositionById = async (positionId) => {
    try {
        const { data, error } = await supabase
            .from('positions')
            .select('*')
            .eq('position_id', positionId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting position:', error)
        return { data: null, error }
    }
}

// Get all positions
export const getAllPositions = async (filters = {}) => {
    try {
        let query = supabase.from('positions').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting positions:', error)
        return { data: null, error }
    }
}

// Update position
export const updatePosition = async (positionId, updateData) => {
    try {
        const dataToUpdate = {
            ...updateData,
            updated_at: new Date()
        }

        const { data, error } = await supabase
            .from('positions')
            .update(dataToUpdate)
            .eq('position_id', positionId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating position:', error)
        return { data: null, error }
    }
}

// Delete position
export const deletePosition = async (positionId) => {
    try {
        const { data, error } = await supabase
            .from('positions')
            .delete()
            .eq('position_id', positionId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting position:', error)
        return { data: null, error }
    }
}

// Create promotion
export const createPromotion = async (promotionData) => {
    try {
        const defaultData = {
            promotiondate: new Date(),
            created_at: new Date(),
            ...promotionData
        }

        const { data, error } = await supabase
            .from('promotion')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating promotion:', error)
        return { data: null, error }
    }
}

// Get promotion by ID
export const getPromotionById = async (promotionId) => {
    try {
        const { data, error } = await supabase
            .from('promotion')
            .select('*')
            .eq('promotionid', promotionId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting promotion:', error)
        return { data: null, error }
    }
}

// Get all promotions
export const getAllPromotions = async (filters = {}) => {
    try {
        let query = supabase.from('promotion').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting promotions:', error)
        return { data: null, error }
    }
}

// Update promotion
export const updatePromotion = async (promotionId, updateData) => {
    try {
        const { data, error } = await supabase
            .from('promotion')
            .update(updateData)
            .eq('promotionid', promotionId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating promotion:', error)
        return { data: null, error }
    }
}

// Delete promotion
export const deletePromotion = async (promotionId) => {
    try {
        const { data, error } = await supabase
            .from('promotion')
            .delete()
            .eq('promotionid', promotionId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting promotion:', error)
        return { data: null, error }
    }
}

// Create promotion history
export const createPromotionHistory = async (promotionHistoryData) => {
    try {
        const defaultData = {
            promotion_date: new Date(),
            created_at: new Date(),
            ...promotionHistoryData
        }

        const { data, error } = await supabase
            .from('promotion_history')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating promotion history:', error)
        return { data: null, error }
    }
}

// Get promotion history by ID
export const getPromotionHistoryById = async (historyId) => {
    try {
        const { data, error } = await supabase
            .from('promotion_history')
            .select('*')
            .eq('id', historyId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting promotion history:', error)
        return { data: null, error }
    }
}

// Get all promotion histories
export const getAllPromotionHistories = async (filters = {}) => {
    try {
        let query = supabase.from('promotion_history').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting promotion histories:', error)
        return { data: null, error }
    }
}

// Update promotion history
export const updatePromotionHistory = async (historyId, updateData) => {
    try {
        const { data, error } = await supabase
            .from('promotion_history')
            .update(updateData)
            .eq('id', historyId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating promotion history:', error)
        return { data: null, error }
    }
}

// Delete promotion history
export const deletePromotionHistory = async (historyId) => {
    try {
        const { data, error } = await supabase
            .from('promotion_history')
            .delete()
            .eq('id', historyId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting promotion history:', error)
        return { data: null, error }
    }
}

// Create report
export const createReport = async (reportData) => {
    try {
        const defaultData = {
            status: 'completed',
            created_at: new Date(),
            config: {},
            ...reportData
        }

        const { data, error } = await supabase
            .from('reports')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating report:', error)
        return { data: null, error }
    }
}

// Get report by ID
export const getReportById = async (reportId) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .select('*')
            .eq('reportid', reportId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting report:', error)
        return { data: null, error }
    }
}

// Get all reports
export const getAllReports = async (filters = {}) => {
    try {
        let query = supabase.from('reports').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting reports:', error)
        return { data: null, error }
    }
}

// Update report
export const updateReport = async (reportId, updateData) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .update(updateData)
            .eq('reportid', reportId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating report:', error)
        return { data: null, error }
    }
}

// Delete report
export const deleteReport = async (reportId) => {
    try {
        const { data, error } = await supabase
            .from('reports')
            .delete()
            .eq('reportid', reportId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting report:', error)
        return { data: null, error }
    }
}

// Create strategic goal
export const createStrategicGoal = async (goalData) => {
    try {
        const defaultData = {
            achieved: false,
            created_at: new Date(),
            ...goalData
        }

        const { data, error } = await supabase
            .from('strategic_goals')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating strategic goal:', error)
        return { data: null, error }
    }
}

// Get strategic goal by ID
export const getStrategicGoalById = async (goalId) => {
    try {
        const { data, error } = await supabase
            .from('strategic_goals')
            .select('*')
            .eq('goal_id', goalId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting strategic goal:', error)
        return { data: null, error }
    }
}

// Get all strategic goals
export const getAllStrategicGoals = async (filters = {}) => {
    try {
        let query = supabase.from('strategic_goals').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting strategic goals:', error)
        return { data: null, error }
    }
}

// Update strategic goal
export const updateStrategicGoal = async (goalId, updateData) => {
    try {
        const { data, error } = await supabase
            .from('strategic_goals')
            .update(updateData)
            .eq('goal_id', goalId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating strategic goal:', error)
        return { data: null, error }
    }
}

// Delete strategic goal
export const deleteStrategicGoal = async (goalId) => {
    try {
        const { data, error } = await supabase
            .from('strategic_goals')
            .delete()
            .eq('goal_id', goalId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting strategic goal:', error)
        return { data: null, error }
    }
}

// Create task
export const createTask = async (taskData) => {
    try {
        const defaultData = {
            priority: 'medium',
            status: 'pending',
            created_at: new Date(),
            updated_at: new Date(),
            ...taskData
        }

        const { data, error } = await supabase
            .from('tasks')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating task:', error)
        return { data: null, error }
    }
}

// Get task by ID
export const getTaskById = async (taskId) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .select('*')
            .eq('id', taskId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting task:', error)
        return { data: null, error }
    }
}

// Get all tasks
export const getAllTasks = async (filters = {}) => {
    try {
        let query = supabase.from('tasks').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting tasks:', error)
        return { data: null, error }
    }
}

// Update task
export const updateTask = async (taskId, updateData) => {
    try {
        const dataToUpdate = {
            ...updateData,
            updated_at: new Date()
        }

        const { data, error } = await supabase
            .from('tasks')
            .update(dataToUpdate)
            .eq('id', taskId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating task:', error)
        return { data: null, error }
    }
}

// Delete task
export const deleteTask = async (taskId) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .delete()
            .eq('id', taskId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting task:', error)
        return { data: null, error }
    }
}

// Create training
export const createTraining = async (trainingData) => {
    try {
        const defaultData = {
            status: 'pending',
            created_at: new Date(),
            ...trainingData
        }

        const { data, error } = await supabase
            .from('training')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating training:', error)
        return { data: null, error }
    }
}

// Get training by ID
export const getTrainingById = async (trainingId) => {
    try {
        const { data, error } = await supabase
            .from('training')
            .select('*')
            .eq('trainingid', trainingId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting training:', error)
        return { data: null, error }
    }
}

// Get all trainings
export const getAllTrainings = async (filters = {}) => {
    try {
        let query = supabase.from('training').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting trainings:', error)
        return { data: null, error }
    }
}

// Update training
export const updateTraining = async (trainingId, updateData) => {
    try {
        const { data, error } = await supabase
            .from('training')
            .update(updateData)
            .eq('trainingid', trainingId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating training:', error)
        return { data: null, error }
    }
}

// Delete training
export const deleteTraining = async (trainingId) => {
    try {
        const { data, error } = await supabase
            .from('training')
            .delete()
            .eq('trainingid', trainingId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting training:', error)
        return { data: null, error }
    }
}

// Create training participant
export const createTrainingParticipant = async (participantData) => {
    try {
        const defaultData = {
            status: 'scheduled',
            created_at: new Date(),
            updated_at: new Date(),
            ...participantData
        }

        const { data, error } = await supabase
            .from('training_participants')
            .insert([defaultData])
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating training participant:', error)
        return { data: null, error }
    }
}

// Get training participant by ID
export const getTrainingParticipantById = async (participantId) => {
    try {
        const { data, error } = await supabase
            .from('training_participants')
            .select('*')
            .eq('id', participantId)
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting training participant:', error)
        return { data: null, error }
    }
}

// Get all training participants
export const getAllTrainingParticipants = async (filters = {}) => {
    try {
        let query = supabase.from('training_participants').select('*')

        Object.keys(filters).forEach(key => {
            query = query.eq(key, filters[key])
        })

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error getting training participants:', error)
        return { data: null, error }
    }
}

// Update training participant
export const updateTrainingParticipant = async (participantId, updateData) => {
    try {
        const dataToUpdate = {
            ...updateData,
            updated_at: new Date()
        }

        const { data, error } = await supabase
            .from('training_participants')
            .update(dataToUpdate)
            .eq('id', participantId)
            .select()
            .single()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error updating training participant:', error)
        return { data: null, error }
    }
}

// Delete training participant
export const deleteTrainingParticipant = async (participantId) => {
    try {
        const { data, error } = await supabase
            .from('training_participants')
            .delete()
            .eq('id', participantId)

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error deleting training participant:', error)
        return { data: null, error }
    }
}

// Batch operations example
export const createMultipleTrainings = async (trainingsArray) => {
    try {
        const trainingsWithDefaults = trainingsArray.map(training => ({
            status: 'pending',
            created_at: new Date(),
            ...training
        }))

        const { data, error } = await supabase
            .from('training')
            .insert(trainingsWithDefaults)
            .select()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error creating multiple trainings:', error)
        return { data: null, error }
    }
}

// Complex query with joins
export const getTrainingWithParticipants = async (trainingId) => {
    try {
        const { data: training, error: trainingError } = await supabase
            .from('training')
            .select('*')
            .eq('trainingid', trainingId)
            .single()

        if (trainingError) throw trainingError

        const { data: participants, error: participantsError } = await supabase
            .from('training_participants')
            .select('*')
            .eq('trainingid', trainingId)

        if (participantsError) throw participantsError

        return {
            data: { ...training, participants },
            error: null
        }
    } catch (error) {
        console.error('Error getting training with participants:', error)
        return { data: null, error }
    }
}

// Search and filter example
export const searchTasks = async (searchCriteria) => {
    try {
        let query = supabase.from('tasks').select('*')

        if (searchCriteria.title) {
            query = query.ilike('title', `%${searchCriteria.title}%`)
        }

        if (searchCriteria.status) {
            query = query.eq('status', searchCriteria.status)
        }

        if (searchCriteria.priority) {
            query = query.eq('priority', searchCriteria.priority)
        }

        if (searchCriteria.dueDateFrom && searchCriteria.dueDateTo) {
            query = query.gte('due_date', searchCriteria.dueDateFrom)
                .lte('due_date', searchCriteria.dueDateTo)
        }

        const { data, error } = await query

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error searching tasks:', error)
        return { data: null, error }
    }
}

// Bulk update example
export const bulkUpdateTaskStatus = async (taskIds, newStatus) => {
    try {
        const { data, error } = await supabase
            .from('tasks')
            .update({
                status: newStatus || null,
                updated_at: new Date() || null
            })
            .in('id', taskIds)
            .select()

        if (error) throw error
        return { data, error: null }
    } catch (error) {
        console.error('Error bulk updating tasks:', error)
        return { data: null, error }
    }
}