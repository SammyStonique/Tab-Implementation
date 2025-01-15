<template>
    <PageStyleComponent :loader="loader" @showLoader="showLoader" @hideLoader="hideLoader">
        <template v-slot:body>
            <div class="fixed bg-white w-[93%] z-50">
                <FilterBar 
                    :addButtonLabel="addButtonLabel" 
                    :filters="searchFilters" 
                    @add-new="addNewLedger"
                    @search="searchChartOfAccounts"
                    @reset="resetFilters"
                    @importData="importData"
                    @removeItem="removeItem"
                    @removeSelectedItems="removeSelectedItems"
                    @printList="printList"
                    :addingRight="addingRight"
                    :rightsModule="rightsModule"
                    :dropdownOptions="dropdownOptions"
                    @handleDynamicOption="handleDynamicOption"
                    :options="options"
                    :dropdownWidth="dropdownWidth"
                    :selectOptions="selectOptions"
                    :updateValue="updateValue"
                    :searchPlaceholder="searchPlaceholder"
                    />
            </div>
            <div class="table-container  min-h-[330px] mt-20 uppercase">
                  <table class="min-w-full bg-white chart-of-accounts-table" style="width: 100%;"> 
                      <thead class="bg-gray-800 text-white">
                          <tr class="rounded bg-slate-800 text-white font-semibold text-xs uppercase">
                              <th style="width: 1%;">#</th>
                              <th class="text-left py-2 px-2" style="width: 10%;">Code</th>
                              <th class="text-left py-2 px-2" style="width: 30%;">Account Name</th>
                              <th class="text-left py-2 px-2" style="width: 15%;">Type</th>
                              <th class="text-left py-2 px-2" style="width: 25%;">Financial Statement</th>
                              <th class="text-left py-2 px-2" style="width: 10%;">Balance</th>
                              <th class="text-left py-2 px-2" style="width: 9%;">Actions</th>
                          </tr>
                      </thead>
                      <tbody>
                      <tr class="text-left font-semibold text-xs uppercase">
                            <td></td>
                            <td></td>
                            <td>Assets</td>
                            <td></td>
                            <td></td>
                            <td></td>
                      </tr>
                      <tr class="text-left font-semibold text-xs uppercase">
                            <td></td>
                            <td></td>
                            <td class="pl-4">Bank/Cash Accounts</td>
                            <td></td>
                            <td></td>
                            <td></td>
                      </tr>
                      <tr v-for="(led,index) in chartOfAccountsList" :key="led.ledger_id" class="even:bg-gray-100 text-xxs cursor-pointer" @dblclick="viewLedger(index)">
                          <td v-if="led.ledger_type=='Cashbook'"></td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Cashbook'">{{ led.ledger_code }}</td>
                          <td class="text-left py-1 px-2 pl-4" v-if="led.ledger_type=='Cashbook'">{{ led.ledger_name }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Cashbook'">{{ led.ledger_type }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Cashbook'">{{ led.financial_statement }}</td>
                          <td class="text-left font-bold py-1 px-2" v-if="led.ledger_type=='Cashbook' && led.balance >= 0">{{ Number(led.balance).toLocaleString() }}</td>
                          <td class="text-left font-bold py-1 px-2 text-red-600" v-else-if="led.ledger_type=='Cashbook' && led.balance < 0">({{ Number(Math.abs(led.balance)).toLocaleString() }})</td>
                          <td v-if="led.ledger_type=='Cashbook'">
                                <div class="flex">
                                  <div class="basis-1/4" :class="{ 'disabled': isDisabled('Editing Posting Account') }">
                                      <button @click="editLedger(index)"><i class="fa fa-pencil" aria-hidden="true" title="Edit"></i></button>
                                  </div>
                                  <div class="basis-1/4" :class="{ 'disabled': isDisabled('View Ledger Statement') }">
                                      <button @click="viewLedger(index)"><i class="fa fa-file-pdf-o" aria-hidden="true" title="View"></i></button>
                                  </div>
                                  <div class="basis-1/4" v-if="led.status === 'Active'" :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                      <button @click="blockLedger(index)"><i class="fa fa-circle-o" aria-hidden="true" title="Block"></i></button>
                                  </div>
                                  <div class="basis-1/4" v-else :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                      <button @click="unblockLedger(index)"><i class="fa fa-ban" aria-hidden="true" title="Unblock"></i></button>
                                  </div>
                                  <div class="basis-1/4" :class="{ 'disabled': isDisabled('Deleting Posting Account') }">
                                      <button @click="removeLedger(index)"><i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i></button>
                                  </div>
                                </div>
                          </td>
                      </tr>
                      <tr class="text-left font-semibold text-xs uppercase">
                            <td></td>
                            <td></td>
                            <td class="pl-4">Current Assets</td>
                            <td></td>
                            <td></td>
                            <td></td>
                      </tr>
                      <tr v-for="(led,index) in chartOfAccountsList" :key="led.ledger_id" class="even:bg-gray-100 text-xxs cursor-pointer" @dblclick="viewLedger(index)">
                          <td v-if="led.ledger_type=='Current Asset'"></td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Current Asset'">{{ led.ledger_code }}</td>
                          <td class="text-left py-1 px-2 pl-4" v-if="led.ledger_type=='Current Asset'">{{ led.ledger_name }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Current Asset'">{{ led.ledger_type }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Current Asset'">{{ led.financial_statement }}</td>
                          <td class="text-left font-bold py-1 px-2" v-if="led.ledger_type=='Current Asset' && led.balance >= 0">{{ Number(led.balance).toLocaleString() }}</td>
                          <td class="text-left font-bold py-1 px-2 text-red-600" v-else-if="led.ledger_type=='Current Asset' && led.balance < 0">({{ Number(Math.abs(led.balance)).toLocaleString() }})</td>
                          <td v-if="led.ledger_type=='Current Asset'">
                            <div class="flex">
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Editing Posting Account') }">
                                    <button @click="editLedger(index)"><i class="fa fa-pencil" aria-hidden="true" title="Edit"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('View Ledger Statement') }">
                                    <button @click="viewLedger(index)"><i class="fa fa-file-pdf-o" aria-hidden="true" title="View"></i></button>
                                </div>
                                <div class="basis-1/4" v-if="led.status === 'Active'" :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="blockLedger(index)"><i class="fa fa-circle-o" aria-hidden="true" title="Block"></i></button>
                                </div>
                                <div class="basis-1/4" v-else :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="unblockLedger(index)"><i class="fa fa-ban" aria-hidden="true" title="Unblock"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Deleting Posting Account') }">
                                    <button @click="removeLedger(index)"><i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i></button>
                                </div>
                            </div>
                          </td>
                      </tr>
                      <tr class="text-left font-semibold text-xs uppercase">
                            <td></td>
                            <td></td>
                            <td class="pl-4">Fixed Assets</td>
                            <td></td>
                            <td></td>
                            <td></td>
                      </tr>
                      <tr v-for="(led,index) in chartOfAccountsList" :key="led.ledger_id" class="even:bg-gray-100 text-xxs cursor-pointer" @dblclick="viewLedger(index)">
                          <td v-if="led.ledger_type=='Fixed Asset'"></td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Fixed Asset'">{{ led.ledger_code }}</td>
                          <td class="text-left py-1 px-2 pl-4" v-if="led.ledger_type=='Fixed Asset'">{{ led.ledger_name }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Fixed Asset'">{{ led.ledger_type }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Fixed Asset'">{{ led.financial_statement }}</td>
                          <td class="text-left font-bold py-1 px-2" v-if="led.ledger_type=='Fixed Asset' && led.balance >= 0">{{ Number(led.balance).toLocaleString() }}</td>
                          <td class="text-left font-bold py-1 px-2 text-red-600" v-else-if="led.ledger_type=='Fixed Asset' && led.balance < 0">({{ Number(Math.abs(led.balance)).toLocaleString() }})</td>
                          <td v-if="led.ledger_type=='Fixed Asset'">
                            <div class="flex">
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Editing Posting Account') }">
                                    <button @click="editLedger(index)"><i class="fa fa-pencil" aria-hidden="true" title="Edit"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('View Ledger Statement') }">
                                    <button @click="viewLedger(index)"><i class="fa fa-file-pdf-o" aria-hidden="true" title="View"></i></button>
                                </div>
                                <div class="basis-1/4" v-if="led.status === 'Active'" :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="blockLedger(index)"><i class="fa fa-circle-o" aria-hidden="true" title="Block"></i></button>
                                </div>
                                <div class="basis-1/4" v-else :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="unblockLedger(index)"><i class="fa fa-ban" aria-hidden="true" title="Unblock"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Deleting Posting Account') }">
                                    <button @click="removeLedger(index)"><i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i></button>
                                </div>
                            </div>
                          </td>
                      </tr>
                      <tr class="text-left font-semibold text-sm uppercase">
                            <td></td>
                            <td></td>
                            <td>Liabilities</td>
                            <td></td>
                            <td></td>
                            <td></td>
                      </tr>
                      <tr class="text-left font-semibold text-xs uppercase">
                            <td></td>
                            <td></td>
                            <td class="pl-4">Current Liabilities</td>
                            <td></td>
                            <td></td>
                            <td></td>
                      </tr>
                      <tr v-for="(led,index) in chartOfAccountsList" :key="led.ledger_id" class="even:bg-gray-100 text-xxs cursor-pointer" @dblclick="viewLedger(index)">
                          <td v-if="led.ledger_type=='Current Liability'"></td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Current Liability'">{{ led.ledger_code }}</td>
                          <td class="text-left py-1 px-2 pl-4" v-if="led.ledger_type=='Current Liability'">{{ led.ledger_name }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Current Liability'">{{ led.ledger_type }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Current Liability'">{{ led.financial_statement }}</td>
                          <td class="text-left font-bold py-1 px-2" v-if="led.ledger_type=='Current Liability' && led.balance >= 0">{{ Number(led.balance).toLocaleString() }}</td>
                          <td class="text-left font-bold py-1 px-2 text-red-600" v-else-if="led.ledger_type=='Current Liability' && led.balance < 0">({{ Number(Math.abs(led.balance)).toLocaleString() }})</td>
                          <td v-if="led.ledger_type=='Current Liability'">
                            <div class="flex">
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Editing Posting Account') }">
                                    <button @click="editLedger(index)"><i class="fa fa-pencil" aria-hidden="true" title="Edit"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('View Ledger Statement') }">
                                    <button @click="viewLedger(index)"><i class="fa fa-file-pdf-o" aria-hidden="true" title="View"></i></button>
                                </div>
                                <div class="basis-1/4" v-if="led.status === 'Active'" :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="blockLedger(index)"><i class="fa fa-circle-o" aria-hidden="true" title="Block"></i></button>
                                </div>
                                <div class="basis-1/4" v-else :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="unblockLedger(index)"><i class="fa fa-ban" aria-hidden="true" title="Unblock"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Deleting Posting Account') }">
                                    <button @click="removeLedger(index)"><i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i></button>
                                </div>
                            </div>
                          </td>
                      </tr>
                      <tr class="text-left font-semibold text-xs uppercase">
                            <td></td>
                            <td></td>
                            <td class="pl-4">Long Term Liabilities</td>
                            <td></td>
                            <td></td>
                            <td></td>
                      </tr>
                      <tr v-for="(led,index) in chartOfAccountsList" :key="led.ledger_id" class="even:bg-gray-100 text-xxs cursor-pointer" @dblclick="viewLedger(index)">
                          <td v-if="led.ledger_type=='Longterm Liability'"></td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Longterm Liability'">{{ led.ledger_code }}</td>
                          <td class="text-left py-1 px-2 pl-4" v-if="led.ledger_type=='Longterm Liability'">{{ led.ledger_name }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Longterm Liability'">{{ led.ledger_type }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Longterm Liability'">{{ led.financial_statement }}</td>
                          <td class="text-left font-bold py-1 px-2" v-if="led.ledger_type=='Longterm Liability' && led.balance >= 0">{{ Number(led.balance).toLocaleString() }}</td>
                          <td class="text-left font-bold py-1 px-2 text-red-600" v-else-if="led.ledger_type=='Longterm Liability' && led.balance < 0">({{ Number(Math.abs(led.balance)).toLocaleString() }})</td>
                          <td v-if="led.ledger_type=='Longterm Liability'">
                            <div class="flex">
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Editing Posting Account') }">
                                    <button @click="editLedger(index)"><i class="fa fa-pencil" aria-hidden="true" title="Edit"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('View Ledger Statement') }">
                                    <button @click="viewLedger(index)"><i class="fa fa-file-pdf-o" aria-hidden="true" title="View"></i></button>
                                </div>
                                <div class="basis-1/4" v-if="led.status === 'Active'" :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="blockLedger(index)"><i class="fa fa-circle-o" aria-hidden="true" title="Block"></i></button>
                                </div>
                                <div class="basis-1/4" v-else :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="unblockLedger(index)"><i class="fa fa-ban" aria-hidden="true" title="Unblock"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Deleting Posting Account') }">
                                    <button @click="removeLedger(index)"><i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i></button>
                                </div>
                            </div>
                          </td>
                      </tr>
                      <tr class="text-left font-semibold text-sm uppercase">
                            <td></td>
                            <td></td>
                            <td>Owner's Equity</td>
                            <td></td>
                            <td></td>
                            <td></td>
                      </tr>
                      <tr v-for="(led,index) in chartOfAccountsList" :key="led.ledger_id" class="even:bg-gray-100 text-xxs cursor-pointer" @dblclick="viewLedger(index)">
                          <td v-if="led.ledger_type=='Owner Equity'"></td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Owner Equity'">{{ led.ledger_code }}</td>
                          <td class="text-left py-1 px-2 pl-4" v-if="led.ledger_type=='Owner Equity'">{{ led.ledger_name }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Owner Equity'">{{ led.ledger_type }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Owner Equity'">{{ led.financial_statement }}</td>
                          <td class="text-left font-bold py-1 px-2" v-if="led.ledger_type=='Owner Equity' && led.balance >= 0">{{ Number(led.balance).toLocaleString() }}</td>
                          <td class="text-left font-bold py-1 px-2 text-red-600" v-else-if="led.ledger_type=='Owner Equity' && led.balance < 0">({{ Number(Math.abs(led.balance)).toLocaleString() }})</td>
                          <td v-if="led.ledger_type=='Owner Equity'">
                            <div class="flex">
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Editing Posting Account') }">
                                    <button @click="editLedger(index)"><i class="fa fa-pencil" aria-hidden="true" title="Edit"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('View Ledger Statement') }">
                                    <button @click="viewLedger(index)"><i class="fa fa-file-pdf-o" aria-hidden="true" title="View"></i></button>
                                </div>
                                <div class="basis-1/4" v-if="led.status === 'Active'" :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="blockLedger(index)"><i class="fa fa-circle-o" aria-hidden="true" title="Block"></i></button>
                                </div>
                                <div class="basis-1/4" v-else :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="unblockLedger(index)"><i class="fa fa-ban" aria-hidden="true" title="Unblock"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Deleting Posting Account') }">
                                    <button @click="removeLedger(index)"><i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i></button>
                                </div>
                            </div>
                          </td>
                      </tr>
                      <tr class="text-left font-semibold text-sm uppercase">
                            <td></td>
                            <td></td>
                            <td>Income</td>
                            <td></td>
                            <td></td>
                            <td></td>
                      </tr>
                      <tr v-for="(led,index) in chartOfAccountsList" :key="led.ledger_id" class="even:bg-gray-100 text-xxs cursor-pointer" @dblclick="viewLedger(index)">
                          <td v-if="led.ledger_type === 'Income'"></td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type === 'Income'">{{ led.ledger_code }}</td>
                          <td class="text-left py-1 px-2 pl-4" v-if="led.ledger_type === 'Income'">{{ led.ledger_name }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type === 'Income'">{{ led.ledger_type }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type === 'Income'">{{ led.financial_statement }}</td>
                          <td class="text-left font-bold py-1 px-2" v-if="led.ledger_type=='Income' && led.balance >= 0">{{ Number(led.balance).toLocaleString() }}</td>
                          <td class="text-left font-bold py-1 px-2 text-red-600" v-else-if="led.ledger_type=='Income' && led.balance < 0">({{ Number(Math.abs(led.balance)).toLocaleString() }})</td>
                          <td v-if="led.ledger_type === 'Income'">
                            <div class="flex">
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Editing Posting Account') }">
                                    <button @click="editLedger(index)"><i class="fa fa-pencil" aria-hidden="true" title="Edit"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('View Ledger Statement') }">
                                    <button @click="viewLedger(index)"><i class="fa fa-file-pdf-o" aria-hidden="true" title="View"></i></button>
                                </div>
                                <div class="basis-1/4" v-if="led.status === 'Active'" :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="blockLedger(index)"><i class="fa fa-circle-o" aria-hidden="true" title="Block"></i></button>
                                </div>
                                <div class="basis-1/4" v-else :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="unblockLedger(index)"><i class="fa fa-ban" aria-hidden="true" title="Unblock"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Deleting Posting Account') }">
                                    <button @click="removeLedger(index)"><i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i></button>
                                </div>
                            </div>
                          </td>
                      </tr>
                      <tr class="text-left font-semibold text-sm uppercase">
                            <td></td>
                            <td></td>
                            <td>Expenses</td>
                            <td></td>
                            <td></td>
                            <td></td>
                      </tr>
                      <tr v-for="(led,index) in chartOfAccountsList" :key="led.ledger_id" class="even:bg-gray-100 text-xxs cursor-pointer" @dblclick="viewLedger(index)">
                          <td v-if="led.ledger_type=='Expenses'"></td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Expenses'">{{ led.ledger_code }}</td>
                          <td class="text-left py-1 px-2 pl-4" v-if="led.ledger_type=='Expenses'">{{ led.ledger_name }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Expenses'">{{ led.ledger_type }}</td>
                          <td class="text-left py-1 px-2" v-if="led.ledger_type=='Expenses'">{{ led.financial_statement }}</td>
                          <td class="text-left font-bold py-1 px-2" v-if="led.ledger_type=='Expenses' && led.balance >= 0">{{ Number(led.balance).toLocaleString() }}</td>
                          <td class="text-left font-bold py-1 px-2 text-red-600" v-else-if="led.ledger_type=='Expenses' && led.balance < 0">({{ Number(Math.abs(led.balance)).toLocaleString() }})</td>
                          <td v-if="led.ledger_type=='Expenses'">
                            <div class="flex">
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Editing Posting Account') }">
                                    <button @click="editLedger(index)"><i class="fa fa-pencil" aria-hidden="true" title="Edit"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('View Ledger Statement') }">
                                    <button @click="viewLedger(index)"><i class="fa fa-file-pdf-o" aria-hidden="true" title="View"></i></button>
                                </div>
                                <div class="basis-1/4" v-if="led.status === 'Active'" :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="blockLedger(index)"><i class="fa fa-circle-o" aria-hidden="true" title="Block"></i></button>
                                </div>
                                <div class="basis-1/4" v-else :class="{ 'disabled': isDisabled('Block Posting Account') }">
                                    <button @click="unblockLedger(index)"><i class="fa fa-ban" aria-hidden="true" title="Unblock"></i></button>
                                </div>
                                <div class="basis-1/4" :class="{ 'disabled': isDisabled('Deleting Posting Account') }">
                                    <button @click="removeLedger(index)"><i class="fa fa-trash-o" aria-hidden="true" title="Delete"></i></button>
                                </div>
                            </div>
                          </td>
                      </tr>
                      </tbody>
                  </table>   
            </div>

    </template>
    </PageStyleComponent>
    <MovableModal v-model:visible="depModalVisible" :title="title" :modal_top="modal_top" :modal_left="modal_left" :modal_width="modal_width"
        :loader="modal_loader" @showLoader="showModalLoader" @hideLoader="hideModalLoader" >
        <DynamicForm 
            :fields="formFields" :flex_basis="flex_basis" :flex_basis_percentage="flex_basis_percentage" 
            :displayButtons="displayButtons" @handleSubmit="saveLedger" @handleReset="handleReset"
        />
    </MovableModal>
</template>

<script>
import axios from "axios";
import { ref, computed, watch, onMounted, onBeforeMount } from 'vue';
import PageStyleComponent from '@/components/PageStyleComponent.vue';
import FilterBar from "@/components/FilterBar.vue";
import MovableModal from '@/components/MovableModal.vue';
import DynamicForm from '../NewDynamicForm.vue';
import { useStore } from "vuex";
import { useToast } from "vue-toastification";

export default{
    name: 'Chart_Of_Accounts',
    components:{
        PageStyleComponent,MovableModal,DynamicForm, FilterBar
    },
    setup(){
        const store = useStore();
        const toast = useToast();
        const loader = ref('');
        const modal_loader = ref('none');
        const title = ref('Ledger Details');
        const addingRight = ref('Adding Posting Account');
        const rightsModule = ref('Accounts');
        const addButtonLabel = ref('New Ledger');
        const idField = 'ledger_id';
        const depModalVisible = ref(false);
        const chartOfAccountsList = ref([]);
        const allowedRights = ref([]);
        const patient_ledger_totals = ref(0);
        const patientLedger = ref(false);
        const vendor_ledger_totals = ref(0);
        const vendorLedger = ref(false);
        const customer_ledger_totals = ref(0);
        const customerLedger = ref(false);
        const tenant_ledger_totals = ref(0);
        const tenantLedger = ref(false);
        const merge_patients_setting = ref('No');
        const merge_vendors_setting = ref('No');
        const merge_debtors_setting = ref('No');
        const merge_tenants_setting = ref('No');
        const depResults = ref([]);
        const depArrLen = ref(0);
        const depCount = ref(0);
        const pageCount = ref(0);
        const currentPage = ref(1);
        const showNextBtn = ref(false);
        const showPreviousBtn = ref(false);
        const flex_basis = ref('');
        const flex_basis_percentage = ref('');
        const displayButtons = ref(true);
        const errors = ref([]);
        const modal_top = ref('150px');
        const modal_left = ref('400px');
        const modal_width = ref('30vw');
        const isEditing = computed(()=> store.state.Ledgers.isEditing)
        const selectedLedger = computed(()=> store.state.Ledgers.selectedLedger);
        const tableColumns = ref([
            {type: "checkbox"},
            {label: "Name", key: "category_name", type: "text", editable: false}
        ])
        const actions = ref([
            {name: 'edit', icon: 'fa fa-edit', title: 'Edit Category'},
            {name: 'delete', icon: 'fa fa-trash', title: 'Delete Category'},
        ])
        const companyID = computed(()=> store.state.userData.company_id);
        const userID = computed(()=> store.state.userData.user_id);
        const defaultSettings = computed(()=> store.state.Default_Settings.settingsList);
        const ledger_code_search = computed({
            get: () => store.state.Ledgers.ledger_code_search,
            set: (value) => store.commit('Ledgers/SET_SEARCH_FILTERS', {"ledger_code_search":value}),
        });
        const ledger_name_search = computed({
            get: () => store.state.Ledgers.ledger_name_search,
            set: (value) => store.commit('Ledgers/SET_SEARCH_FILTERS', {"ledger_name_search":value}),
        });
        const financial_statement_search = computed({
            get: () => store.state.Ledgers.financial_statement_search,
            set: (value) => store.commit('Ledgers/SET_SEARCH_FILTERS', {"financial_statement_search":value}),
        });
        const searchFilters = ref([
            {type:'text', placeholder:"Search Code...", value: ledger_code_search, width: 36},
            {type:'text', placeholder:"Search Name...", value: ledger_name_search, width:48,},
            {
                type:'dropdown', placeholder:"Financial Statement..", value: financial_statement_search, width:48,
                options: [{text:'Income Statement',value:'Income Statement'},{text:'Balance Sheet',value:'Balance Sheet'}]
            },
        ]);
        const fetchDefaultSettings = async() =>{
            await store.dispatch('Default_Settings/fetchDefaultSettings', {company:companyID.value})
            for(let i=0; i < defaultSettings.value.length; i++){
                if(defaultSettings.value[i].setting_name === 'Merge Patients Ledgers in Reports'){
                    merge_patients_setting.value = defaultSettings.value[i].setting_value_name;
                }else if(defaultSettings.value[i].setting_name === 'Merge Debtors Ledgers in Reports'){
                    merge_debtors_setting.value = defaultSettings.value[i].setting_value_name;
                }else if(defaultSettings.value[i].setting_name === 'Merge Vendors Ledgers in Reports'){
                    merge_vendors_setting.value = defaultSettings.value[i].setting_value_name;
                }else if(defaultSettings.value[i].setting_name === 'Merge Tenants Ledgers in Reports'){
                    merge_tenants_setting.value = defaultSettings.value[i].setting_value_name;
                }
            }
        };
        const formFields = ref([]);
        const updateFormFields = () => {
            formFields.value = [
                { type: 'text', name: 'ledger_code',label: "Code", value: selectedLedger.value?.ledger_code || '', required: true },
                { type: 'text', name: 'ledger_name',label: "Name", value: selectedLedger.value?.ledger_name || '', required: true },
                { type: 'dropdown', name: 'ledger_type',label: "Ledger Type", value: selectedLedger.value?.ledger_type || '', placeholder: "", required: true, options: [{ text: 'Cashbook', value: 'Cashbook' }, { text: 'Current Asset', value: 'Current Asset' }, { text: 'Fixed Asset', value: 'Fixed Asset' }, { text: 'Current Liability', value: 'Current Liability' }, { text: 'Longterm Liability', value: 'Longterm Liability' },{ text: 'Owner Equity', value: 'Owner Equity' },{ text: 'Income', value: 'Income' },{ text: 'Expenses', value: 'Expenses' }] },

            ];
        };

        watch([selectedLedger], () => {
            if(selectedLedger.value){
                updateFormFields();
            }        
        }, { immediate: true });

        const fetchEnabledRights = () =>{
            allowedRights.value = [];
            let formData = {
                user: userID.value,
                company: companyID.value,
                module: rightsModule.value
            }
            axios
            .post("api/v1/user-permissions-search/",formData)
            .then((response)=>{
                allowedRights.value = response.data.results;
            })
            .catch((error)=>{
                console.log(error.message);
            })
        };
        const isDisabled =(permissionName) =>{
            const permission = allowedRights.value.find(p => p.permission_name === permissionName);
            return permission ? !permission.right_status : true;
        };

        const addNewLedger = () =>{
            updateFormFields();
            depModalVisible.value = true;
            handleReset();
            store.dispatch("Ledgers/updateState",{isEditing:false, selectedLedger: null})
            flex_basis.value = '1/2';
            flex_basis_percentage.value = '50';
        }

        const handleReset = () =>{
            for(let i=0; i < formFields.value.length; i++){
                formFields.value[i].value = '';
            }
        }
        const showModalLoader = () =>{
            modal_loader.value = "block";
        }
        const hideModalLoader = () =>{
            modal_loader.value = "none";
        }
        const createLedger = async() =>{
            showModalLoader();
            let formData = {
                ledger_type: formFields.value[2].value,
                ledger_code: formFields.value[0].value,
                ledger_name: formFields.value[1].value,
                financial_statement: (formFields.value[2].value == "Income" || formFields.value[2].value == "Expenses") ? "Income Statement" : "Balance Sheet",
                company: companyID.value
            }
            errors.value = [];
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                toast.error('Fill In Required Fields');
                hideModalLoader();
            }else{
                try {
                    const response = await store.dispatch('Ledgers/createLedger', formData);
                    if(response && response.status === 201) {
                        hideModalLoader();
                        toast.success('Ledger created successfully!');
                        handleReset();
                    }else {
                        toast.error('An error occurred while creating the ledger.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to create ledger: ' + error.message);
                } finally {
                    hideModalLoader();
                    searchChartOfAccounts();
                }
            }

        }
        const editLedger = (index) =>{
            if(!isDisabled('Editing Posting Account') ){
                depModalVisible.value = true;
                store.commit('Ledgers/SET_SELECTED_LEDGER', chartOfAccountsList.value[index]); 
                flex_basis.value = '1/2';
                flex_basis_percentage.value = '50'; 
            }        
        };
        const updateLedger = async() =>{
            showModalLoader();
            errors.value = [];
            let formData = {
                ledger_type: formFields.value[2].value,
                ledger_code: formFields.value[0].value,
                ledger_name: formFields.value[1].value,
                financial_statement: selectedLedger.value.financial_statement,
                ledger: selectedLedger.value.ledger_id,
                company: companyID.value
            }
            for(let i=0; i < formFields.value.length; i++){
                if(formFields.value[i].value =='' && formFields.value[i].required == true){
                    errors.value.push('Error');
                }
            }
            if(errors.value.length){
                    toast.error('Fill In Required Fields');
            }else{
                try {
                    const response = await store.dispatch('Ledgers/updateLedger', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Ledger updated successfully!");
                        handleReset();

                    } else {
                        toast.error('An error occurred while updating the Ledger.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to update Ledger: ' + error.message);
                } finally {
                    hideModalLoader();
                    store.dispatch("Ledgers/updateState",{isEditing:false, selectedLedger: null})
                    searchChartOfAccounts();
                }
            }
        }
        const saveLedger = () =>{
            if(isEditing.value == true){
                updateLedger();
            }else{
                createLedger();
            }
        }
        const viewLedger = async(index) =>{
            if(!isDisabled('View Ledger Statement') ){
                let formData1 = {
                    ledger: chartOfAccountsList.value[index].ledger_id,
                    company: companyID.value,
                }
                store.commit('pageTab/ADD_PAGE', {'FA':'Ledger_Details'});
                store.state.pageTab.faActiveTab = 'Ledger_Details'; 
                await store.dispatch('Ledgers/fetchLedger', formData1)
                await store.dispatch('Ledgers/updateState', {ledgerID: chartOfAccountsList.value[index].ledger_id, ledgerRunningBalance:0 })
            }
        }
        const removeLedger = async(index) =>{
            if(!isDisabled('Deleting Posting Account') ){
                let formData = {
                    company: companyID.value,
                    ledger: chartOfAccountsList.value[index].ledger_id
                }
                await store.dispatch('Ledgers/deleteLedger', formData); 
            }
        }

        const blockLedger = async(index) =>{
            if(!isDisabled('Block Posting Account') ){
                store.commit('Ledgers/SET_SELECTED_LEDGER', chartOfAccountsList.value[index]); 
                let formData = {
                    ledger_type: selectedLedger.value.ledger_type,
                    ledger_code: selectedLedger.value.ledger_code,
                    ledger_name: selectedLedger.value.ledger_name,
                    financial_statement: selectedLedger.value.financial_statement,
                    ledger: selectedLedger.value.ledger_id,
                    status: "Inactive",
                    company: companyID.value
                }
                try {
                    const response = await store.dispatch('Ledgers/updateLedger', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Ledger Blocked Successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while blocking the Ledger.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to block Ledger: ' + error.message);
                } finally {
                    hideModalLoader();
                    store.dispatch("Ledgers/updateState",{isEditing:false, selectedLedger: null})
                    searchChartOfAccounts();
                }
            }
        }

        const unblockLedger = async(index) =>{
            if(!isDisabled('Block Posting Account') ){
                store.commit('Ledgers/SET_SELECTED_LEDGER', chartOfAccountsList.value[index]); 
                let formData = {
                    ledger_type: selectedLedger.value.ledger_type,
                    ledger_code: selectedLedger.value.ledger_code,
                    ledger_name: selectedLedger.value.ledger_name,
                    financial_statement: selectedLedger.value.financial_statement,
                    ledger: selectedLedger.value.ledger_id,
                    status: "Active",
                    company: companyID.value
                }
                try {
                    const response = await store.dispatch('Ledgers/updateLedger', formData);
                    if (response && response.status === 200) {
                        hideModalLoader();
                        toast.success("Ledger Unblocked Successfully!");
                        handleReset();
                    } else {
                        toast.error('An error occurred while unblocking the Ledger.');
                    }
                } catch (error) {
                    console.error(error.message);
                    toast.error('Failed to unblock Ledger: ' + error.message);
                } finally {
                    hideModalLoader();
                    store.dispatch("Ledgers/updateState",{isEditing:false, selectedLedger: null})
                    searchChartOfAccounts();
                }
            }
        }

        const showLoader = () =>{
            loader.value = "block";
        }
        const hideLoader = () =>{
            loader.value = "none";
        }
        const searchChartOfAccounts = () =>{
            showLoader();
            patient_ledger_totals.value = 0;
            vendor_ledger_totals.value = 0;
            tenant_ledger_totals.value = 0;

            let formData = {
                ledger_code: ledger_code_search.value,
                ledger_name: ledger_name_search.value,
                financial_statement: financial_statement_search.value,
                company_id: companyID.value
            }
            axios
            .post(`api/v1/chart-of-accounts-search/?page=${currentPage.value}`,formData)
            .then((response)=>{
                for(let i = response.data.results.length - 1; i >= 0; i--){
                    if(response.data.results[i].ledger_category === "Patients" && merge_patients_setting.value === 'Yes'){
                        patient_ledger_totals.value += response.data.results[i].balance;
                        patientLedger.value = true;
                        response.data.results.splice(i, 1);
                    }else if(response.data.results[i].ledger_category === "Vendors" && merge_vendors_setting.value === 'Yes'){
                        vendor_ledger_totals.value += response.data.results[i].balance;
                        vendorLedger.value = true;
                        response.data.results.splice(i, 1);
                    }else if(response.data.results[i].ledger_category === "Debtors" && merge_debtors_setting.value === 'Yes'){
                        customer_ledger_totals.value += response.data.results[i].balance;
                        customerLedger.value = true;
                        response.data.results.splice(i, 1);
                    }else if(response.data.results[i].ledger_category === "Tenants" && merge_tenants_setting.value === 'Yes'){
                        tenant_ledger_totals.value += response.data.results[i].balance;
                        tenantLedger.value = true;
                        response.data.results.splice(i, 1);
                    }               
                }

                if(response.data.results.length){
                    if(patientLedger.value){
                        let patientArr ={
                            "ledger_code": 'PAT',
                            "ledger_name": 'PATIENTS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Patients',
                            "financial_statement": 'Balance Sheet',
                            "balance": patient_ledger_totals.value,
                            "status": 'Active',
                        }
                        response.data.results.push(patientArr);
                    }
                    if(customerLedger.value){
                        let customersArr ={
                            "ledger_code": 'DEB',
                            "ledger_name": 'DEBTORS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Debtors',
                            "financial_statement": 'Balance Sheet',
                            "balance": customer_ledger_totals.value,
                            "status": 'Active',
                        }
                        response.data.results.push(customersArr);
                    }
                    if(vendorLedger.value){
                        let vendorsArr ={
                            "ledger_code": 'VEN',
                            "ledger_name": 'VENDORS',
                            "ledger_type": 'Current Liability',
                            "ledger_category": 'Vendors',
                            "financial_statement": 'Balance Sheet',
                            "balance": vendor_ledger_totals.value,
                            "status": 'Active',
                        }
                        response.data.results.push(vendorsArr);
                    }
                    if(tenantLedger.value){
                        let tenantArr ={
                            "ledger_code": 'TNT',
                            "ledger_name": 'TENANTS',
                            "ledger_type": 'Current Asset',
                            "ledger_category": 'Tenants',
                            "financial_statement": 'Balance Sheet',
                            "balance": tenant_ledger_totals.value,
                            "status": 'Active',
                        }
                        response.data.results.push(tenantArr);
                    }
                }
                chartOfAccountsList.value = response.data.results;
            })
            .catch((error)=>{
                console.log(error);
            })
            .finally(()=>{
                hideLoader();
            })
        }
        const loadPrev = () =>{
            if (currentPage.value <= 1){
                currentPage.value = 1;
            }else{
                currentPage.value -= 1;
            }
            
            searchChartOfAccounts();
        }
        const loadNext = () =>{
            if(currentPage.value >= pageCount.value){
                currentPage.value = pageCount.value;
            }else if(currentPage.value < pageCount.value){
                currentPage.value += 1;
            }
            
            searchChartOfAccounts();
        }
        const firstPage = ()=>{
            currentPage.value = 1;
            searchChartOfAccounts();
        }
        const lastPage = () =>{
            currentPage.value = pageCount.value;
            searchChartOfAccounts();
        }
        const resetFilters = () =>{
            store.commit('Ledgers/RESET_SEARCH_FILTERS')
            searchChartOfAccounts();
        };

        onBeforeMount(()=>{
            fetchDefaultSettings();  
            fetchEnabledRights();         
        });
        onMounted(()=>{
            searchChartOfAccounts();
        })
        return{
            title,idField, searchChartOfAccounts, addButtonLabel, searchFilters, resetFilters, tableColumns, chartOfAccountsList,
            depResults, depArrLen, depCount, pageCount, showNextBtn, showPreviousBtn,modal_top, modal_left, modal_width,
            loadPrev, loadNext, firstPage, lastPage, actions, formFields, depModalVisible, addNewLedger,
            displayButtons,flex_basis,flex_basis_percentage, handleReset, saveLedger,
            showLoader, loader, hideLoader, modal_loader, showModalLoader, hideModalLoader, removeLedger,
            fetchEnabledRights, isDisabled, editLedger, blockLedger, unblockLedger, viewLedger,addingRight,rightsModule
        }
    }
}
</script>

<style scoped>
.disabled {
  opacity: 0.5;
  pointer-events: none;
}
.table-container thead th {
  position: sticky;
  top: 0;
  background: #3b4252;
}
.chart-of-accounts-table{
    min-height: 50vh;
    width: 100%;
    border-collapse: collapse;
    table-layout: fixed;
}
</style>