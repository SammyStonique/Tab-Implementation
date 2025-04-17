<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="px-8 py-8 pb-1 w-full">
                <div class="border-b-2 border-gray-500 px-3 py-2 text-left">
                    <button class="w-full text-left font-semibold" @click="showPMSSettings">PMS Default Settings</button>
                    <div class="w-full mt-4" v-if="pms_settings_options">
                        <div class="flex mb-1.5">
                            <div class="basis-1/4 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ rentalIncome }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('PMS','Rental Income Posting A/c',rentalIncome)" v-if="rentalIncome"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/4 mr-8 relative">
                                <label for="">Rental Income A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="incomeLedgerArr"
                                    :updateValue="selectedRentalIncome"
                                    :dropdownWidth="dropdownWidth"
                                    @option-selected="handleSelectedLedger"
                                    @clearSearch="clearSelectedLedger"   
                                    @fetchData="fetchIncomeLedgers"                              
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('PMS','Rental Income Posting A/c',ledgerID,ledgerName)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/6 mr-3 relative">
                                <label for="">Tenant Code Prefix:<em>*</em></label><br />
                                <input type="text" name="" id="" class="bg-slate-50 rounded pl-3 border border-gray-400 text-base w-3/4" v-model="tenantCodePrefix">
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('PMS','Tenant Code Prefix',tenantCodePrefix,tenantCodePrefix)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/6 mr-3 relative">
                                <label for="">Tenant Code Zero Padding:<em>*</em></label><br />
                                <input type="number" name="" id="" class="bg-slate-50 rounded pl-3 border border-gray-400 text-base w-3/4" v-model="tenantCodeCounter">
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('PMS','Tenant Code Zero Padding',tenantCodeCounter,tenantCodeCounter)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-1.5">
                            <div class="basis-1/4 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ rentalSecurityDeposit }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('PMS','Rental Security Deposits Posting A/c',rentalSecurityDeposit)" v-if="rentalSecurityDeposit"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/4 mr-8 relative">
                                <label for="">Security Deposits Payable A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="liabilityLedgerArr"
                                    :updateValue="selectedSalesIncome"
                                    :dropdownWidth="dropdownWidth"
                                    @option-selected="handleSelectedLedger"
                                    @clearSearch="clearSelectedLedger"
                                    @fetchData="fetchLiabilityLedgers"   
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('PMS','Rental Security Deposits Posting A/c',ledgerID,ledgerName)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/6 relative mr-3">
                                <label for="">Automatic Tenant Invoicing:<em>*</em></label><br />
                                <select  v-model="pmsAutoInvoiceOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-3/4">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-2 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('PMS','Automatic Tenant Invoicing',pmsAutoInvoiceOption,pmsAutoInvoiceOption)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/6 relative mr-3">
                                <label for="">Tenant Invoicing Day:<em>*</em></label><br />
                                <input type="text" name="" id="" class="bg-slate-50 rounded pl-3 border border-gray-400 text-base w-3/4" v-model="tenantInvoiceDay">
                                <button type="button" class="absolute ml-2 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('PMS','Tenant Invoicing Day',tenantInvoiceDay,tenantInvoiceDay)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-1.5">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ rentalLeaseIncome }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('PMS','Lease Fees Income Posting A/c',rentalLeaseIncome)" v-if="rentalLeaseIncome"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/4 mr-3 relative">
                                <label for="">Lease Fees Posting A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="incomeLedgerArr"
                                    :updateValue="selectedBalancingAccount"
                                    :dropdownWidth="dropdownWidth"
                                    @option-selected="handleSelectedLedger"
                                    @clearSearch="clearSelectedLedger"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('PMS','Lease Fees Income Posting A/c',ledgerID,ledgerName)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-1.5">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ rentalPenaltyIncome }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('PMS','Penalty Income Posting A/c',rentalPenaltyIncome)" v-if="rentalPenaltyIncome"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/4 mr-3 relative">
                                <label for="">Penalty Income Posting A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="incomeLedgerArr"
                                    :updateValue="selectedBalancingAccount"
                                    :dropdownWidth="dropdownWidth"
                                    @option-selected="handleSelectedLedger"
                                    @clearSearch="clearSelectedLedger"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('PMS','Penalty Income Posting A/c',ledgerID,ledgerName)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-b-2 border-gray-500 px-3 py-2 text-left">
                    <button class="w-full text-left font-semibold" @click="showHMSSettings">HMS Default Settings</button>
                    <div class="w-full mt-4" v-if="hms_settings_options">
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ stock_control }}</p>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/4 mr-3">
                                <label for="">Stock Control A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="stockControlArr"
                                    :updateValue="selectedStockControl"
                                    :dropdownWidth="dropdownWidth"
                                    :searchPlaceholder="stockPlaceholder"
                                    @option-selected="handleSelectedStockControl"
                                    @clearSearch="handleClearStockControl"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveStockControlMapping"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ sales_income }}</p>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/4 mr-3">
                                <label for="">Sales Income A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="salesIncomeArr"
                                    :updateValue="selectedSalesIncome"
                                    :dropdownWidth="dropdownWidth"
                                    :searchPlaceholder="salesPlaceholder"
                                    @option-selected="handleSelectedSalesIncome"
                                    @clearSearch="handleClearSalesIncome"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveSalesIncomeMapping"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ inventory_take_on }}</p>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/4 mr-3">
                                <label for="">Inventory Take On Balancing A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="balancingAccountArr"
                                    :updateValue="selectedBalancingAccount"
                                    :dropdownWidth="dropdownWidth"
                                    :searchPlaceholder="balancePlaceholder"
                                    @option-selected="handleSelectedBalancingAccount"
                                    @clearSearch="handleClearBalancingAccount"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveBalancingAccountMapping"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-b-2 border-gray-500 px-3 py-2 text-left">
                    <button class="w-full text-left font-semibold" @click="showAccountsSettings">Accounts Default Settings</button>
                    <div class="w-full mt-4" v-if="accounts_settings_options">
                        <div class="flex mb-3">
                            <div class="basis-1/4 relative mr-12">
                                <label for="">Merge Patients Ledgers in Reports:<em>*</em></label><br />
                                <select  v-model="patientsOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-2 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Accounts','Merge Patients Ledgers in Reports',patientsOption,patientsOption)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/4 relative mr-12">
                                <label for="">Allow Duplicate Transactions:<em>*</em></label><br />
                                <select  v-model="duplicatesOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-2 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Accounts','Allow Duplicate Transactions',duplicatesOption,duplicatesOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/4 relative mr-12">
                                <label for="">Merge Debtors Ledgers in Reports:<em>*</em></label><br />
                                <select  v-model="debtorsOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-2 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Accounts','Merge Debtors Ledgers in Reports',debtorsOption,debtorsOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/4 relative mr-12">
                                <label for="">Merge Vendors Ledgers in Reports:<em>*</em></label><br />
                                <select  v-model="vendorsOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-2 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Accounts','Merge Vendors Ledgers in Reports',vendorsOption,vendorsOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/4 relative mr-12">
                                <label for="">Merge Tenants Ledgers in Reports:<em>*</em></label><br />
                                <select  v-model="tenantsOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-2 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Accounts','Merge Tenants Ledgers in Reports',tenantsOption,tenantsOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-b-2 border-gray-500 px-3 py-2 text-left">
                    <button class="w-full text-left font-semibold" @click="showMembershipSettings">Membership Default Settings</button>
                    <div class="w-full mt-4" v-if="membership_settings_options">
                        <div class="flex mb-3">
                            <div class="basis-1/4 relative mr-12">
                                <label for="">Loan Penalty Automation:<em>*</em></label><br />
                                <select  v-model="mmsAutoPenalizeOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-2 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('MMS','Loan Penalty Automation',mmsAutoPenalizeOption,mmsAutoPenalizeOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/4 relative mr-12">
                                <label for="">Disable Strict Guarantorship:<em>*</em></label><br />
                                <select  v-model="mmsStrictGuarantorshipOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-2 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('MMS','Disable Strict Guarantorship',mmsStrictGuarantorshipOption,mmsStrictGuarantorshipOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-b-2 border-gray-500 px-3 py-2 text-left">
                    <button class="w-full text-left font-semibold" @click="showHRSettings">HR Default Settings</button>
                    <div class="w-full mt-4" v-if="hr_settings_options">
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ stock_control }}</p>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/4 mr-3">
                                <label for="">Stock Control A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="stockControlArr"
                                    :updateValue="selectedStockControl"
                                    :dropdownWidth="ledgerDropdownWidth"
                                    :searchPlaceholder="stockPlaceholder"
                                    @option-selected="handleSelectedStockControl"
                                    @clearSearch="handleClearStockControl"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveStockControlMapping"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ sales_income }}</p>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/4 mr-3">
                                <label for="">Sales Income A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="salesIncomeArr"
                                    :updateValue="selectedSalesIncome"
                                    :dropdownWidth="ledgerDropdownWidth"
                                    :searchPlaceholder="salesPlaceholder"
                                    @option-selected="handleSelectedSalesIncome"
                                    @clearSearch="handleClearSalesIncome"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveSalesIncomeMapping"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ inventory_take_on }}</p>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/4 mr-3">
                                <label for="">Inventory Take On Balancing A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="balancingAccountArr"
                                    :updateValue="selectedBalancingAccount"
                                    :dropdownWidth="ledgerDropdownWidth"
                                    :searchPlaceholder="balancePlaceholder"
                                    @option-selected="handleSelectedBalancingAccount"
                                    @clearSearch="handleClearBalancingAccount"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveBalancingAccountMapping"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-b-2 border-gray-500 px-3 py-2 text-left">
                    <button class="w-full text-left font-semibold" @click="showInventorySettings">Inventory Default Settings</button>
                    <div class="w-full mt-4" v-if="inventory_settings_options">
                        <div class="flex mb-1.5">
                            <div class="basis-1/3 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ retailOutlet }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Default Retail Outlet',retailOutlet)" v-if="retailOutlet"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                            <div class="basis-1/3 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ stockControl }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Inventory Stock Control A/c',stockControl)" v-if="stockControl"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                            <div class="basis-1/3 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ salesIncome }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Inventory Sales Income A/c',salesIncome)" v-if="salesIncome"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/3 mr-4 relative">
                                <label for="">Default Retail Outlet:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="retailOutletArr"
                                    :updateValue="selectedRetailOutlet"
                                    :dropdownWidth="dropdownWidth"
                                    @option-selected="handleSelectedOutlet"
                                    @clearSearch="clearSelectedOutlet"   
                                    @fetchData="fetchRetailOutlets"                              
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Default Retail Outlet',outletID,outletName)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/3 mr-4 relative">
                                <label for="">Stock Control A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="ledgerArr"
                                    :updateValue="selectedLedger"
                                    :dropdownWidth="dropdownWidth"
                                    @option-selected="handleSelectedLedger"
                                    @clearSearch="clearSelectedLedger"   
                                    @fetchData="fetchLedgers"                              
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Inventory Stock Control A/c',ledgerID,ledgerName)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/3 mr-3 relative">
                                <label for="">Sales Income A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="incomeLedgerArr"
                                    :updateValue="selectedSalesIncome"
                                    :dropdownWidth="dropdownWidth"
                                    @option-selected="handleSelectedLedger"
                                    @clearSearch="clearSelectedLedger"
                                    @fetchData="fetchIncomeLedgers"   
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Inventory Sales Income A/c',ledgerID,ledgerName)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-1.5">
                            <div class="basis-1/3 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ outletCounter }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Default Outlet Counter',outletCounter)" v-if="outletCounter"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                            <div class="basis-1/3 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ invTakeOn }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Inventory Take On Balancing A/c',invTakeOn)" v-if="invTakeOn"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                            <div class="basis-1/3 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ directSaleOrder }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Direct Sale Order',directSaleOrder)" v-if="directSaleOrder"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/3 mr-4 relative">
                                <label for="">Default Outlet Counter:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="outletCounterArr"
                                    :updateValue="selectedOutletCounter"
                                    :dropdownWidth="dropdownWidth"
                                    @option-selected="handleSelectedCounter"
                                    @clearSearch="clearSelectedCounter"
                                    @fetchData="fetchOutletCounters"   
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Default Outlet Counter',counterID,counterName)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/3 mr-4 relative">
                                <label for="">Inventory Take On Balancing A/c:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="ledgerArr"
                                    :updateValue="selectedLedger"
                                    :dropdownWidth="dropdownWidth"
                                    @option-selected="handleSelectedLedger"
                                    @clearSearch="clearSelectedLedger"   
                                    @fetchData="fetchLedgers"                              
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Inventory Take On Balancing A/c',ledgerID,ledgerName)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/3 relative">
                                <label for="">Direct Sale Order:<em>*</em></label><br />
                                <select  v-model="directSaleOrder" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-3/4">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Direct Sale Order',directSaleOrder,directSaleOrder)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-1.5">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ counterChannel }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Default Counter Channel',counterChannel)" v-if="counterChannel"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/4 mr-3 relative">
                                <label for="">Default Counter Channel:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="counterChannelArr"
                                    :updateValue="selectedCounterChannel"
                                    :dropdownWidth="dropdownWidth"
                                    @option-selected="handleSelectedChannel"
                                    @clearSearch="clearSelectedChannel"
                                    @fetchData="fetchCounterChannels" 
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Default Counter Channel',channelID,channelName)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/3 relative">
                                <label for="">Default Stock Type:<em>*</em></label><br />
                                <select  v-model="stockType" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-3/4">
                                    <option value="Stocked">Stocked</option>
                                    <option value="Serialized">Serialized</option>
                                    <option value="Non Stocked">Non Stocked</option>
                                    <option value="Service">Service</option>
                                </select>
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Default Stock Type',stockType,stockType)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-b-2 border-gray-500 px-3 py-2 text-left">
                    <button class="w-full text-left font-semibold" @click="showSettingsSettings">Settings Default Settings</button>
                    <div class="w-full mt-4" v-if="settings_settings_options">
                        <div class="flex mb-3">
                            <div class="basis-1/3 flex mr-3">
                                <label for="">Current:<em></em></label>
                                <p class="ml-4 font-bold">{{ defaultTimeout }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Settings','Default System Timeout',defaultTimeout)" v-if="defaultTimeout"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/4 mr-3 relative">
                                <label for="">Default System Timeout(in mins):<em>*</em></label><br />
                                <input v-model="defaultTimeout" type="number" pattern="[0-9]*" oninput="this.value = this.value.replace(/[^0-9]/g, '')" :class="`bg-slate-50 rounded pl-3 border border-gray-400 text-base w-full`"/>
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Settings','Default System Timeout',defaultTimeout,defaultTimeout)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </template>
    </PageStyleComponent>
</template>

<script>
import { defineComponent, ref, onBeforeMount, onMounted, computed, watch, reactive } from 'vue';
import PageStyleComponent from '../PageStyleComponent.vue';
import SearchableDropdown from '../SearchableDropdown.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";
import Swal from 'sweetalert2';
import axios from 'axios';

export default defineComponent({
    name: 'Default_Settings',
    components:{
        PageStyleComponent, SearchableDropdown
    },
    setup(props,{emit}){
        const store = useStore();
        const toast = useToast();
        const loader = ref('none');
        const mainComponentKey = ref(0);
        const settingsArray = ref([]);
        const companyID = computed(()=> store.state.userData.company_id);
        const ledgerArr = computed(() => store.state.Ledgers.ledgerArr);
        const incomeLedgerArr = computed(() => store.state.Ledgers.incomeLedgerArr);
        const expenseLedgerArr = computed(() => store.state.Ledgers.expenseLedgerArr);
        const cashbookLedgerArr = computed(() => store.state.Ledgers.cashbookLedgerArr);
        const liabilityLedgerArr = computed(() => store.state.Ledgers.liabilityLedgerArr);
        const retailOutletArr = computed(() => store.state.Retail_Outlets.outletArr);
        const outletCounterArr = computed(() => store.state.Outlet_Counters.counterArr);
        const counterChannelArr = computed(() => store.state.Counter_Channels.channelArr);

        const hms_settings_options = ref(false);
        const inventory_settings_options = ref(false);
        const pms_settings_options = ref(false);
        const hr_settings_options = ref(false);
        const settings_settings_options = ref(false);
        const accounts_settings_options = ref(false);
        const membership_settings_options = ref(false);

        const rentalIncome = ref("");
        const rentalSecurityDeposit = ref("");
        const rentalPenaltyIncome = ref("");
        const rentalLeaseIncome = ref("");
        const tenantCodePrefix = ref("");
        const tenantCodeCounter = ref(0);
        const pmsAutoInvoiceOption = ref("");
        const tenantInvoiceDay = ref(0);

        const patientsOption = ref("");
        const duplicatesOption = ref("");
        const debtorsOption = ref("");
        const vendorsOption = ref("");
        const tenantsOption = ref("");

        const mmsAutoPenalizeOption = ref("");
        const mmsStrictGuarantorshipOption = ref("");

        const retailOutlet = ref("");
        const outletCounter = ref("");
        const counterChannel = ref("");
        const stockType = ref("");
        const stockControl = ref("");
        const salesIncome = ref("");
        const invTakeOn = ref("");
        const directSaleOrder = ref("");

        const defaultTimeout = ref(0);

        const dropdownWidth = ref("320px");
        const incomePlaceholder = ref("Select Income A/c");

        const ledgerID = ref("");
        const ledgerName = ref("");
        const outletID = ref("");
        const outletName = ref("");
        const counterID = ref("");
        const counterName = ref("");
        const channelID = ref("");
        const channelName = ref("");

        const showHMSSettings = () =>{
            fetchDefaultSetting('HMS');
            inventory_settings_options.value = false;
            accounts_settings_options.value = false;
            pms_settings_options.value = false;
            hr_settings_options.value  = false;
            settings_settings_options.value = false;
            membership_settings_options.value  = false;
            hms_settings_options.value  = !hms_settings_options.value ;
        }

        const showPMSSettings = () =>{
            fetchDefaultSetting('PMS');
            inventory_settings_options.value = false;
            accounts_settings_options.value = false;
            hms_settings_options.value = false;
            hr_settings_options.value  = false;
            settings_settings_options.value = false;
            membership_settings_options.value  = false;
            pms_settings_options.value  = !pms_settings_options.value ;
        }
        const showMembershipSettings = () =>{
            fetchDefaultSetting('MMS');
            inventory_settings_options.value = false;
            accounts_settings_options.value = false;
            pms_settings_options.value = false;
            hr_settings_options.value  = false;
            settings_settings_options.value = false;
            hms_settings_options.value = false;
            membership_settings_options.value  = !membership_settings_options.value ;
        }
        const showAccountsSettings = () =>{
            fetchDefaultSetting('Accounts');
            inventory_settings_options.value = false;
            hms_settings_options.value = false;
            pms_settings_options.value = false;
            hr_settings_options.value  = false;
            settings_settings_options.value = false;
            membership_settings_options.value  = false;
            accounts_settings_options.value  = !accounts_settings_options.value ;
        }
        const showInventorySettings = () =>{
            fetchRetailOutlets();
            fetchDefaultSetting('Inventory');
            hms_settings_options.value = false;
            accounts_settings_options.value = false;
            pms_settings_options.value = false;
            hr_settings_options.value  = false;
            settings_settings_options.value = false;
            membership_settings_options.value  = false;
            inventory_settings_options.value  = !inventory_settings_options.value ;
        }
        const showHRSettings = () =>{
            fetchDefaultSetting('HR');
            hms_settings_options.value = false;
            accounts_settings_options.value = false;
            pms_settings_options.value = false;
            inventory_settings_options.value  = false;
            settings_settings_options.value = false;
            membership_settings_options.value  = false;
            hr_settings_options.value  = !hr_settings_options.value ;
        }    
        const showSettingsSettings = () =>{
            fetchDefaultSetting('Settings');
            hms_settings_options.value = false;
            accounts_settings_options.value = false;
            pms_settings_options.value = false;
            inventory_settings_options.value  = false;
            inventory_settings_options.value = false;
            membership_settings_options.value  = false;
            settings_settings_options.value  = !settings_settings_options.value ;
        }

        const fetchLedgers = async() =>{
            let formData = {
                company: companyID.value,
                ledger_category: "General Ledger"
            }
            await store.dispatch("Ledgers/fetchLedgers", formData)
        }

        const fetchIncomeLedgers = async() =>{
            let formData = {
                company: companyID.value,
                ledger_type: "Income",
                ledger_category: "General Ledger"
            }
            await store.dispatch("Ledgers/fetchIncomeLedgers", formData)
        }

        const fetchExpenseLedgers = async() =>{
            let formData = {
                company: companyID.value,
                ledger_type: "Expense",
                ledger_category: "General Ledger"
            }
            await store.dispatch("Ledgers/fetchExpenseLedgers", formData)
        }

        const fetchCashbookLedgers = async() =>{
            let formData = {
                company: companyID.value,
                ledger_type: "Cashbook",
                ledger_category: "General Ledger"
            }
            await store.dispatch("Ledgers/fetchCashbookLedgers", formData)
        }

        const fetchLiabilityLedgers = async() =>{
            let formData = {
                company: companyID.value,
                ledger_type: "Current Liability",
                ledger_category: "General Ledger"
            }
            await store.dispatch("Ledgers/fetchLiabilityLedgers", formData)
        }

        const handleSelectedLedger = async(option) =>{
            await store.dispatch('Ledgers/handleSelectedLedger', option)
            ledgerID.value = store.state.Ledgers.ledgerID;
            ledgerName.value = store.state.Ledgers.ledgerName;

        };
        const clearSelectedLedger = async() =>{
            await store.dispatch('Ledgers/updateState', {ledgerID: '', ledgerName: ""});
            ledgerID.value = "";
            ledgerName.value = "";
        }

        const fetchRetailOutlets = async() =>{
            let formData = {
                company: companyID.value,
            }
            await store.dispatch("Retail_Outlets/fetchOutlets", formData)
        }

        const handleSelectedOutlet = async(option) =>{
            await store.dispatch('Retail_Outlets/handleSelectedOutlet', option)
            outletID.value = store.state.Retail_Outlets.outletID;
            outletName.value = store.state.Retail_Outlets.outletName;
            fetchOutletCounters();
        };
        const clearSelectedOutlet = async() =>{
            await store.dispatch('Retail_Outlets/updateState', {outletID: '', outletName: ""});
            outletID.value = "";
            outletName.value = "";
        }

        const fetchOutletCounters = async() =>{
            if(outletID.value){
                let formData = {
                    company: companyID.value,
                    outlet: outletID.value
                }
                await store.dispatch("Outlet_Counters/fetchCounters", formData)
            }
        }

        const handleSelectedCounter = async(option) =>{
            await store.dispatch('Outlet_Counters/handleSelectedCounter', option)
            counterID.value = store.state.Outlet_Counters.counterID;
            counterName.value = store.state.Outlet_Counters.counterName;
            fetchCounterChannels();
        };
        const clearSelectedCounter = async() =>{
            await store.dispatch('Retail_Outlets/updateState', {counterID: '', counterName: ""});
            counterID.value = "";
            counterName.value = "";
        }

        const fetchCounterChannels = async() =>{
            if(counterID.value){
                let formData = {
                    company: companyID.value,
                    outlet_counter: counterID.value
                }
                await store.dispatch("Counter_Channels/fetchChannels", formData)
            }
        }

        const handleSelectedChannel = async(option) =>{
            await store.dispatch('Counter_Channels/handleSelectedChannel', option)
            channelID.value = store.state.Counter_Channels.ledgerID;
            channelName.value = store.state.Counter_Channels.channelName;

        };
        const clearSelectedChannel = async() =>{
            await store.dispatch('Counter_Channels/updateState', {ledgerID: '', channelName: ""});
            channelID.value = "";
            channelName.value = "";
        }

        const showLoader = () =>{
            loader.value = "block";
        };
        const hideLoader = () =>{
            loader.value = "none";
        };

        const fetchDefaultSetting = (setting_module) =>{
            let formData = {
                module: setting_module,
                company: companyID.value
            }
            axios
            .post("api/v1/fetch-default-settings/", formData)
            .then((response)=>{
                for(let i=0; i<response.data.length; i++){
                    if(response.data[i].setting_name === 'Rental Income Posting A/c'){
                        rentalIncome.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Lease Fees Income Posting A/c'){
                        rentalLeaseIncome.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Rental Security Deposits Posting A/c'){
                        rentalSecurityDeposit.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Penalty Income Posting A/c'){
                        rentalPenaltyIncome.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Tenant Code Prefix'){
                        tenantCodePrefix.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Tenant Code Zero Padding'){
                        tenantCodeCounter.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Automatic Tenant Invoicing'){
                        pmsAutoInvoiceOption.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Tenant Invoicing Day'){
                        tenantInvoiceDay.value = response.data[i].setting_value_name;
                    }


                    else if(response.data[i].setting_name === 'Loan Penalty Automation'){
                        mmsAutoPenalizeOption.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Disable Strict Guarantorship'){
                        mmsStrictGuarantorshipOption.value = response.data[i].setting_value_name;
                    }

                    
                    else if(response.data[i].setting_name === 'Merge Patients Ledgers in Reports'){
                        patientsOption.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Merge Debtors Ledgers in Reports'){
                        debtorsOption.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Merge Vendors Ledgers in Reports'){
                        vendorsOption.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Merge Tenants Ledgers in Reports'){
                        tenantsOption.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Allow Duplicate Transactions'){
                        duplicatesOption.value = response.data[i].setting_value_name;
                    }

                    
                    else if(response.data[i].setting_name === 'Default Retail Outlet'){
                        retailOutlet.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Default Outlet Counter'){
                        outletCounter.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Default Counter Channel'){
                        counterChannel.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Inventory Stock Control A/c'){
                        stockControl.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Default Stock Type'){
                        stockType.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Inventory Sales Income A/c'){
                        salesIncome.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Inventory Take On Balancing A/c'){
                        invTakeOn.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Direct Sale Order'){
                        directSaleOrder.value = response.data[i].setting_value_name;
                    }

                    else if(response.data[i].setting_name === 'Default System Timeout'){
                        defaultTimeout.value = response.data[i].setting_value_name;
                    }
                }
            })
        }

        const saveDefaultSetting = (setting_module,setting_name,setting_value,setting_value_name) =>{
            showLoader();
            settingsArray.value = [];
            if(setting_name === ''){
                toast.error("Invalid Option")
                hideLoader();
            }
            else{
                let formData = {
                    module: setting_module,
                    setting_name: setting_name,
                    setting_value: setting_value,
                    setting_value_name: setting_value_name,
                    company: companyID.value
                }
                axios
                .post("api/v1/create-default-setting/", formData)
                .then((response)=>{
                    if(response.status === 200){
                        toast.success("Success")
                        hideLoader();
                        fetchDefaultSetting(setting_module);
                    }
                    else{
                        toast.error("Error")
                    }                
                })
                .catch((error)=>{
                    console.log(error.message);
                    toast.error(error.message)
                })
            }
        }
        const removeDefaultSetting = (setting_module,setting_name,setting_value_name) =>{
            settingsArray.value = [];
            Swal.fire({
                title: "Are you sure?",
                text: `Do you wish to remove ${setting_value_name} as default?`,
                type: 'warning',
                showCloseButton: true,
                showCancelButton: true,
                confirmButtonText: 'Yes Remove it!',
                cancelButtonText: 'Cancel!',
                showLoaderOnConfirm: true,
            }).then((result) => {
                if (result.value) {
                    settingsArray.value.push(setting_module,setting_name,setting_value_name);
                    let formData = {
                        company: companyID.value,
                        setting_name: setting_name,
                        module: setting_module
                    }
                    axios
                    .post("api/v1/delete-default-setting/", formData)
                    .then((response)=>{
                        if(response.status === 200){
                            Swal.fire("Poof! Setting removed succesfully!", {
                                icon: "success",
                            });
                            mainComponentKey.value += 1;
                        }
                        
                    })
                    .catch((error)=>{
                        console.log(error.message);
                    })
                
                } else {
                    Swal.fire(`${setting_value_name} has not been removed!`);
                }
            });
        }
    
        onMounted(()=>{ 
            store.dispatch("Ledgers/fetchLedgers", {company:companyID.value})
        })

        return{
            loader,showLoader,hideLoader,hms_settings_options,inventory_settings_options,pms_settings_options,hr_settings_options,accounts_settings_options,membership_settings_options,
            settings_settings_options, showHMSSettings, showPMSSettings, showAccountsSettings, showInventorySettings, showHRSettings, showSettingsSettings,showMembershipSettings,
            dropdownWidth,incomePlaceholder, ledgerArr, incomeLedgerArr, expenseLedgerArr, liabilityLedgerArr, cashbookLedgerArr, fetchIncomeLedgers, fetchExpenseLedgers,
            fetchCashbookLedgers, fetchLiabilityLedgers, rentalIncome, rentalSecurityDeposit, rentalLeaseIncome, rentalPenaltyIncome,fetchLedgers,
            ledgerID,ledgerName, handleSelectedLedger, clearSelectedLedger, saveDefaultSetting, removeDefaultSetting, tenantCodePrefix, tenantCodeCounter,pmsAutoInvoiceOption,tenantInvoiceDay,
            patientsOption,duplicatesOption, debtorsOption, vendorsOption, tenantsOption, fetchRetailOutlets,handleSelectedOutlet, clearSelectedOutlet, fetchOutletCounters,outletID,outletName,counterID,counterName,
            channelID,channelName,handleSelectedCounter, clearSelectedCounter, fetchCounterChannels,handleSelectedChannel, clearSelectedChannel,outletCounterArr,retailOutletArr,counterChannelArr,
            retailOutlet, outletCounter, counterChannel, salesIncome, invTakeOn, stockControl, stockType,directSaleOrder,defaultTimeout,
            mmsAutoPenalizeOption,mmsStrictGuarantorshipOption
        }
    }
});
</script>

<style scoped>
em{
  color: red;
}
.inset-button{
    min-height: 100vh;
}

</style>