import { createStore } from 'vuex';
import tab1 from './modules/tab1Store';
import tab2 from './modules/tab2Store';
import modulesTab from './modules/modulesTab';
import pageTab from './modules/pageTab';
import Appointments from './HMS/Appointments';

import Departments from './HMS/Departments';
import Patients_List from './HMS/Patients_List';
import Medical_Fees from './HMS/Medical_Fees';
import Doctors from './HMS/Doctors';
import userData from './userData';

import Properties_List from './PMS/Properties_List';
import Zones from './PMS/Zones';
import Landlords_List from './PMS/Landlords_List';
import Units_List from './PMS/Units_List';
import Active_Tenants from './PMS/Active_Tenants';
import Terminated_Leases from './PMS/Terminated_Leases';
import Utilities from './PMS/Utilities';
import Security_Deposits from './PMS/Security_Deposits';
import Variation_Periods from './PMS/Variation_Periods';
import Tenant_Deposits from './PMS/Tenant_Deposits';
import Meter_Setup from './PMS/Meter_Setup';
import Meter_Readings from './PMS/Meter_Readings';
import Tenant_Prepayments from './PMS/Tenant_Prepayments';
import Prepayment_Allocations from './PMS/Prepayment_Allocations';
import Statement_Transactions from './PMS/Statement_Transactions';
import Property_Statements from './PMS/Property_Statements';
import Tenant_Arrears from './PMS/Tenant_Arrears';
import Lease_Fees from './PMS/Lease_Fees';
import Exit_Charges from './PMS/Exit_Charges';
import Templates from './PMS/Templates';
import Late_Payment_Fees from './PMS/Late_Payment_Fees';
import Tenant_Balances from './PMS/Tenant_Balances';

import Client_Categories from './FA/Client_Categories';
import Currencies from './FA/Currencies';
import Ledgers from './FA/Ledgers';
import Taxes from './FA/Taxes';
import Journals from './FA/Journals';
import Customers from './FA/Customers';
import Vendors from './FA/Vendors';
import Fiscal_Periods from './FA/Fiscal_Periods';

import Item_Categories from './INV/Item_Categories';
import Items_Catalog from './INV/Items_Catalog';
import Uom from './INV/Uom';
import Retail_Outlets from './INV/Retail_Outlets';
import Item_Location from './INV/Item_Location';
import Outlet_Counters from './INV/Outlet_Counters';
import Direct_Sales from './INV/Direct_Sales';
import Counter_Channels from './INV/Counter_Channels';
import Direct_Purchases from './INV/Direct_Purchases';
import Stock_Adjustments from './INV/Stock_Adjustments';
import Stock_Transfers from './INV/Stock_Transfers';


import Pay_Cycles from './HR/Pay_Cycles';
import Pay_Groups from './HR/Pay_Groups';
import Deductions from './HR/Deductions';
import Employee_Deductions from './HR/Employee_Deductions';
import Leave_Types from './HR/Leave_Types';
import Holidays from './HR/Holidays';
import Paye from './HR/Paye';
import Nssf from './HR/Nssf';
import Shif from './HR/Shif';
import Housing_Levy from './HR/Housing_Levy';
import Employees from './HR/Employees';
import Payrolls from './HR/Payrolls';
import Leave_Applications from './HR/Leave_Applications';
import Leave_Ammendments from './HR/Leave_Ammendments';
import Leave_Allocations from './HR/Leave_Allocations';
import Salary_Advances from './HR/Salary_Advances';
import Employee_Loan_Applications from './HR/Loan_Applications';
import Employee_Loan_Disbursements from './HR/Loan_Disbursements';
import Appraisals from './HR/Appraisals';
import Performance_Indicators from './HR/Performance_Indicators';
import Skill_Ratings from './HR/Skill_Ratings';
import Appraisal_Periods from './HR/Appraisal_Periods';
import Appraisal_Categories from './HR/Appraisal_Categories';
import Disciplinary_Categories from './HR/Disciplinary_Categories';
import Disciplinary_Cases from './HR/Disciplinary_Cases';
import Disciplinary_Meetings from './HR/Disciplinary_Meetings';
import Disciplinary_Reviews from './HR/Disciplinary_Reviews';
import Disciplinary_Actions from './HR/Disciplinary_Actions';
import Disciplinary_Appeals from './HR/Disciplinary_Appeals';
import Employee_Rewards from './HR/Employee_Rewards';


import Member_Categories from './MMS/Member_Categories';
import Member_Sponsors from './MMS/Member_Sponsors';
import Members from './MMS/Members';
import Membership_Fees from './MMS/Membership_Fees';
import Savings_Products from './MMS/Savings_Products';
import Shares_Products from './MMS/Shares_Products';
import Saving_Accounts from './MMS/Saving_Accounts';
import Share_Accounts from './MMS/Share_Accounts';
import Saving_Deposits from './MMS/Saving_Deposits';
import Share_Deposits from './MMS/Share_Deposits';
import Loan_Products from './MMS/Loan_Products';
import Loan_Fees from './MMS/Loan_Fees';
import Loan_Applications from './MMS/Loan_Applications';
import Loan_Schedules from './MMS/Loan_Schedules';
import Loan_Guarantors from './MMS/Loan_Guarantors';
import Loan_Disbursements from './MMS/Loan_Disbursements';
import Security_Types from './MMS/Security_Types';
import Loan_Securities from './MMS/Loan_Securities';
import Application_Fees from './MMS/Application_Fees';
import Penalty_Batches from './MMS/Penalty_Batches';
import Loan_Penalties from './MMS/Loan_Penalties';


import Default_Settings from './SET/Default_Settings';
import Companies from './SET/Companies';
import Branches from './SET/Branches';
import Banks from './SET/Banks';
import User_Rights from './SET/User_Rights';
import SMS_Integrations from './SET/SMS_Integrations';
import Email_Integrations from './SET/Email_Integrations';
import Mpesa_Integrations from './SET/Mpesa_Integrations';
import Mpesa_Transactions from './SET/Mpesa_Transactions';
import SMS_Templates from './SET/SMS_Templates';
import Email_Templates from './SET/Email_Templates';


export default createStore({
  modules: {
    tab1,
    tab2,
    modulesTab,
    pageTab,
    userData,
    Appointments,Client_Categories,Departments,Patients_List,Medical_Fees,Doctors,
    
    Properties_List, Zones, Landlords_List, Units_List, Active_Tenants, Utilities,Security_Deposits,Variation_Periods, Tenant_Deposits,Terminated_Leases,
    Meter_Setup, Meter_Readings,Tenant_Prepayments,Prepayment_Allocations,Statement_Transactions,Property_Statements,Tenant_Arrears,Lease_Fees,Exit_Charges,
    Templates,Late_Payment_Fees,Tenant_Balances,

    Item_Categories,Items_Catalog,Uom,Retail_Outlets,Item_Location,Outlet_Counters,Direct_Sales,Counter_Channels,Direct_Purchases,
    Stock_Adjustments,Stock_Transfers,
    
    Ledgers, Currencies, Taxes, Journals, Customers, Vendors,Fiscal_Periods,

    Pay_Cycles,Pay_Groups,Deductions,Leave_Types,Holidays,Paye,Nssf,Shif,Housing_Levy,Employees,Payrolls,Leave_Applications,Leave_Allocations,Salary_Advances,
    Employee_Loan_Applications,Employee_Loan_Disbursements,Leave_Ammendments,Appraisals,Performance_Indicators,Skill_Ratings,Appraisal_Periods,Appraisal_Categories,
    Disciplinary_Categories,Disciplinary_Cases,Disciplinary_Meetings,Disciplinary_Reviews,Disciplinary_Actions,Disciplinary_Appeals,Employee_Rewards,Employee_Deductions,

    Member_Categories,Member_Sponsors,Members,Membership_Fees,Savings_Products,Shares_Products,Saving_Accounts,Share_Accounts,Saving_Deposits,Share_Deposits,
    Loan_Products,Loan_Fees,Loan_Applications,Loan_Guarantors,Loan_Disbursements,Security_Types,Loan_Securities,Application_Fees,Loan_Schedules,Loan_Penalties,
    Penalty_Batches,

    Default_Settings,Companies,Branches,User_Rights,SMS_Integrations,Email_Integrations,Mpesa_Integrations,Mpesa_Transactions,Banks,SMS_Templates,Email_Templates
  },
});
