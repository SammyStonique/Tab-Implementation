<template>
    <PageStyleComponent :key="mainComponentKey" :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="px-8 py-8 pb-1 w-full">
                <div class="border-b-2 border-gray-500 px-3 py-2 text-left">
                    <button class="w-full text-left font-semibold" @click="showPMSSettings">PMS Default Settings</button>
                    <div class="w-full mt-4" v-if="pms_settings_options">
                        <div class="flex mb-1.5">
                            <div class="basis-1/3 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
                                <p class="ml-4 font-bold">{{ rentalIncome }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('PMS','Rental Income Posting A/c',rentalIncome)" v-if="rentalIncome"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                            <div class="basis-1/3 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
                                <p class="ml-4 font-bold">{{ tenantCodePrefix }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('PMS','Tenant Code Prefix',tenantCodePrefix)" v-if="tenantCodePrefix"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                            <div class="basis-1/3 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
                                <p class="ml-4 font-bold">{{ tenantCodeCounter }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('PMS','Tenant Code Zero Padding',tenantCodeCounter)" v-if="tenantCodeCounter"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/3 mr-8 relative">
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
                            <div class="basis-1/3 mr-3 relative">
                                <label for="">Tenant Code Prefix:<em>*</em></label><br />
                                <input type="text" name="" id="" class="bg-slate-50 rounded pl-3 border border-gray-400 text-base w-3/4" v-model="tenantCodePrefix">
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('PMS','Tenant Code Prefix',tenantCodePrefix,tenantCodePrefix)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/3 mr-3 relative">
                                <label for="">Tenant Code Zero Padding:<em>*</em></label><br />
                                <input type="number" name="" id="" class="bg-slate-50 rounded pl-3 border border-gray-400 text-base w-3/4" v-model="tenantCodeCounter">
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('PMS','Tenant Code Zero Padding',tenantCodeCounter,tenantCodeCounter)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-1.5">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
                                <p class="ml-4 font-bold">{{ rentalSecurityDeposit }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('PMS','Rental Security Deposits Posting A/c',rentalSecurityDeposit)" v-if="rentalSecurityDeposit"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/4 mr-3 relative">
                                <label for="">Security Deposits Paybale A/c:<em>*</em></label><br />
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
                        </div>
                        <div class="flex mb-1.5">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
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
                                <label for="">Current Selection:<em></em></label>
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
                                <label for="">Current Selection:<em></em></label>
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
                                <label for="">Current Selection:<em></em></label>
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
                                <label for="">Current Selection:<em></em></label>
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
                            <div class="basis-1/3 relative">
                                <label for="">Merge Patients Ledgers in Reports:<em>*</em></label><br />
                                <select  v-model="patientsOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Accounts','Merge Patients Ledgers in Reports',patientsOption,patientsOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/3 relative">
                                <label for="">Merge Debtors Ledgers in Reports:<em>*</em></label><br />
                                <select  v-model="debtorsOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Accounts','Merge Debtors Ledgers in Reports',debtorsOption,debtorsOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/3 relative">
                                <label for="">Merge Vendors Ledgers in Reports:<em>*</em></label><br />
                                <select  v-model="vendorsOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Accounts','Merge Vendors Ledgers in Reports',vendorsOption,vendorsOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/3 relative">
                                <label for="">Merge Tenants Ledgers in Reports:<em>*</em></label><br />
                                <select  v-model="tenantsOption" name="" class="bg-slate-50 rounded border border-gray-400 text-sm pl-2 pt-2 w-full">
                                    <option value="Yes">Yes</option>
                                    <option value="No">No</option>
                                </select>
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Accounts','Merge Tenants Ledgers in Reports',tenantsOption,tenantsOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-b-2 border-gray-500 px-3 py-2 text-left">
                    <button class="w-full text-left font-semibold" @click="showHRSettings">HR Default Settings</button>
                    <div class="w-full mt-4" v-if="hr_settings_options">
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
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
                                <label for="">Current Selection:<em></em></label>
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
                                <label for="">Current Selection:<em></em></label>
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
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
                                <p class="ml-4 font-bold">{{ defaultOutlet }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Default Outlet',default_outlet)" v-if="default_outlet"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
                                <p class="ml-4 font-bold">{{ defaultStockType }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Default Stock Type',default_stock_type)" v-if="default_stock_type"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/2 mr-3">
                                <label for="">Default Outlet:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="outletsArr"
                                    :updateValue="selectedOutlet"
                                    :dropdownWidth="ledgerDropdownWidth"
                                    :searchPlaceholder="outletPlaceholder"
                                    @option-selected="handleSelectedOutlet"
                                    @clearSearch="handleClearOutlet"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Default Outlet',outletID,outletName)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/2 mr-3">
                                <label for="">Default Stock Type:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="stockTypeArr"
                                    :updateValue="selectedStockType"
                                    :dropdownWidth="ledgerDropdownWidth"
                                    :searchPlaceholder="stockTypePlaceholder"
                                    @option-selected="handleSelectedStockType"
                                    @clearSearch="handleClearStockType"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Default Stock Type',selectedStockType,selectedStockType)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
                                <p class="ml-4 font-bold">{{ defaultCounter }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Default Counter',default_counter)" v-if="default_counter"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
                                <p class="ml-4 font-bold">{{ defaultSellingPrice }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Update Selling Price For All Batches',default_selling_price)" v-if="default_selling_price"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/2 mr-3">
                                <label for="">Default Counter:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="countersArr"
                                    :updateValue="selectedCounter"
                                    :dropdownWidth="ledgerDropdownWidth"
                                    :searchPlaceholder="counterPlaceholder"
                                    @option-selected="handleSelectedCounter"
                                    @clearSearch="handleClearCounter"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Default Counter',counterID,counterName)"><i class="fa fa-check"></i></button>
                            </div>
                            <div class="basis-1/2 mr-3">
                                <label for="">Update Selling Price For All Batches:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="optionsArr"
                                    :updateValue="selectedSellingPriceOption"
                                    :dropdownWidth="ledgerDropdownWidth"
                                    :searchPlaceholder="optionsPlaceholder"
                                    @option-selected="handleSelectedSellingPriceOption"
                                    @clearSearch="handleClearSellingPriceOption"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Update Selling Price For All Batches',selectedSellingPriceOption,selectedSellingPriceOption)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
                                <p class="ml-4 font-bold">{{ defaultChannel }}</p>
                                <button type="button" class="ml-4 text-red-600" @click="removeDefaultSetting('Inventory','Default Counter Channel',default_channel)" v-if="default_channel"><i class="fa fa-times" aria-hidden="true"></i></button>
                            </div>
                        </div>
                        <div class="flex mb-6">
                            <div class="basis-1/4 mr-3">
                                <label for="">Default Channel:<em>*</em></label><br />
                                <SearchableDropdown
                                    :options="channelsArr"
                                    :dropdownWidth="ledgerDropdownWidth"
                                    :searchPlaceholder="channelPlaceholder"
                                    @option-selected="handleSelectedChannel"
                                    @clearSearch="handleClearChannel"
                                />
                                <button type="button" class="absolute ml-4 rounded px-2 bg-green-500 text-white" @click="saveDefaultSetting('Inventory','Default Counter Channel',channelID,channelName)"><i class="fa fa-check"></i></button>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="border-b-2 border-gray-500 px-3 py-2 text-left">
                    <button class="w-full text-left font-semibold" @click="showSettingsSettings">Settings Default Settings</button>
                    <div class="w-full mt-4" v-if="settings_settings_options">
                        <div class="flex mb-3">
                            <div class="basis-1/2 flex mr-3">
                                <label for="">Current Selection:<em></em></label>
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
                                <label for="">Current Selection:<em></em></label>
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
                                <label for="">Current Selection:<em></em></label>
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
        const incomeLedgerArr = computed(() => store.state.Ledgers.incomeLedgerArr);
        const expenseLedgerArr = computed(() => store.state.Ledgers.expenseLedgerArr);
        const cashbookLedgerArr = computed(() => store.state.Ledgers.cashbookLedgerArr);
        const liabilityLedgerArr = computed(() => store.state.Ledgers.liabilityLedgerArr);

        const hms_settings_options = ref(false);
        const inventory_settings_options = ref(false);
        const pms_settings_options = ref(false);
        const hr_settings_options = ref(false);
        const settings_settings_options = ref(false);
        const accounts_settings_options = ref(false);

        const rentalIncome = ref("");
        const rentalSecurityDeposit = ref("");
        const rentalPenaltyIncome = ref("");
        const rentalLeaseIncome = ref("");
        const tenantCodePrefix = ref("");
        const tenantCodeCounter = ref(0);

        const patientsOption = ref("");
        const debtorsOption = ref("");
        const vendorsOption = ref("");
        const tenantsOption = ref("");

        const dropdownWidth = ref("320px");
        const incomePlaceholder = ref("Select Income A/c");

        const ledgerID = ref("");
        const ledgerName = ref("");

        const showHMSSettings = () =>{
            fetchDefaultSetting('HMS');
            inventory_settings_options.value = false;
            accounts_settings_options.value = false;
            pms_settings_options.value = false;
            hr_settings_options.value  = false;
            settings_settings_options.value = false;
            hms_settings_options.value  = !hms_settings_options.value ;
        }

        const showPMSSettings = () =>{
            fetchDefaultSetting('PMS');
            inventory_settings_options.value = false;
            accounts_settings_options.value = false;
            hms_settings_options.value = false;
            hr_settings_options.value  = false;
            settings_settings_options.value = false;
            pms_settings_options.value  = !pms_settings_options.value ;
        }
        const showAccountsSettings = () =>{
            fetchDefaultSetting('Accounts');
            inventory_settings_options.value = false;
            hms_settings_options.value = false;
            pms_settings_options.value = false;
            hr_settings_options.value  = false;
            settings_settings_options.value = false;
            accounts_settings_options.value  = !accounts_settings_options.value ;
        }
        const showInventorySettings = () =>{
            fetchDefaultSetting('Inventory');
            hms_settings_options.value = false;
            accounts_settings_options.value = false;
            pms_settings_options.value = false;
            hr_settings_options.value  = false;
            settings_settings_options.value = false;
            inventory_settings_options.value  = !inventory_settings_options.value ;
        }
        const showHRSettings = () =>{
            fetchDefaultSetting('HR');
            hms_settings_options.value = false;
            accounts_settings_options.value = false;
            pms_settings_options.value = false;
            inventory_settings_options.value  = false;
            settings_settings_options.value = false;
            hr_settings_options.value  = !hr_settings_options.value ;
        }    
        const showSettingsSettings = () =>{
            fetchDefaultSetting('Settings');
            hms_settings_options.value = false;
            accounts_settings_options.value = false;
            pms_settings_options.value = false;
            inventory_settings_options.value  = false;
            inventory_settings_options.value = false;
            settings_settings_options.value  = !settings_settings_options.value ;
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
                    }
                    else if(response.data[i].setting_name === 'Lease Fees Income Posting A/c'){
                        rentalLeaseIncome.value = response.data[i].setting_value_name;
                    }
                    else if(response.data[i].setting_name === 'Rental Security Deposits Posting A/c'){
                        rentalSecurityDeposit.value = response.data[i].setting_value_name;
                    }
                    else if(response.data[i].setting_name === 'Penalty Income Posting A/c'){
                        rentalPenaltyIncome.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Tenant Code Prefix'){
                        tenantCodePrefix.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Tenant Code Zero Padding'){
                        tenantCodeCounter.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Merge Patients Ledgers in Reports'){
                        patientsOption.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Merge Debtors Ledgers in Reports'){
                        debtorsOption.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Merge Vendors Ledgers in Reports'){
                        vendorsOption.value = response.data[i].setting_value_name;
                    }else if(response.data[i].setting_name === 'Merge Tenants Ledgers in Reports'){
                        tenantsOption.value = response.data[i].setting_value_name;
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
            loader,showLoader,hideLoader,hms_settings_options,inventory_settings_options,pms_settings_options,hr_settings_options,accounts_settings_options,
            settings_settings_options, showHMSSettings, showPMSSettings, showAccountsSettings, showInventorySettings, showHRSettings, showSettingsSettings,
            dropdownWidth,incomePlaceholder, incomeLedgerArr, expenseLedgerArr, liabilityLedgerArr, cashbookLedgerArr, fetchIncomeLedgers, fetchExpenseLedgers,
            fetchCashbookLedgers, fetchLiabilityLedgers, rentalIncome, rentalSecurityDeposit, rentalLeaseIncome, rentalPenaltyIncome,
            ledgerID,ledgerName, handleSelectedLedger, clearSelectedLedger, saveDefaultSetting, removeDefaultSetting, tenantCodePrefix, tenantCodeCounter,
            patientsOption, debtorsOption, vendorsOption, tenantsOption
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