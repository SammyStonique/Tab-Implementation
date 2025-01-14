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
import Leave_Types from './HR/Leave_Types';
import Holidays from './HR/Holidays';
import Paye from './HR/Paye';
import Nssf from './HR/Nssf';
import Shif from './HR/Shif';
import Housing_Levy from './HR/Housing_Levy';
import Employees from './HR/Employees';
import Payrolls from './HR/Payrolls';
import Leave_Applications from './HR/Leave_Applications';
import Leave_Allocations from './HR/Leave_Allocations';


import Member_Categories from './MMS/Member_Categories';
import Member_Sponsors from './MMS/Member_Sponsors';
import Members from './MMS/Members';


import Default_Settings from './SET/Default_Settings';
import Companies from './SET/Companies';
import Branches from './SET/Branches';
import Banks from './SET/Banks';
import User_Rights from './SET/User_Rights';
import SMS_Integrations from './SET/SMS_Integrations';
import Email_Integrations from './SET/Email_Integrations';
import Mpesa_Integrations from './SET/Mpesa_Integrations';
import Mpesa_Transactions from './SET/Mpesa_Transactions';


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
    Templates,

    Item_Categories,Items_Catalog,Uom,Retail_Outlets,Item_Location,Outlet_Counters,Direct_Sales,Counter_Channels,Direct_Purchases,
    Stock_Adjustments,Stock_Transfers,
    
    Ledgers, Currencies, Taxes, Journals, Customers, Vendors,Fiscal_Periods,

    Pay_Cycles,Pay_Groups,Deductions,Leave_Types,Holidays,Paye,Nssf,Shif,Housing_Levy,Employees,Payrolls,Leave_Applications,Leave_Allocations,

    Member_Categories,Member_Sponsors,Members,

    Default_Settings,Companies,Branches,User_Rights,SMS_Integrations,Email_Integrations,Mpesa_Integrations,Mpesa_Transactions,Banks
  },
});
