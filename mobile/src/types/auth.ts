export interface Employee {
  employeeId: string;
  name: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface EmployeeLoginResponse {
  success: boolean;
  message: string;
  token: string;
  employee: Employee;
}