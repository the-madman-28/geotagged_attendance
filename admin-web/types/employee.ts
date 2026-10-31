export interface Employee {
  employeeId: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface EmployeesResponse {
  success: boolean;
  employees: Employee[];
}

export interface EmployeeResponse {
  success: boolean;
  employee: Employee;
}

export interface CreateEmployeeResponse {
  success: boolean;
  message: string;
  employee: Employee;
}

export interface UpdateEmployeeStatusResponse {
  success: boolean;
  message: string;
  employee: Employee;
}

export interface ResetDeviceResponse {
  success: boolean;
  message: string;
  deletedCount: number;
}