sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, exportLibrary, Spreadsheet) {
    "use strict";

    var EdmType = exportLibrary.EdmType;

    return BaseController.extend("freestylerap.abaprapfreestyle.controller.Worklist", {

        formatter: formatter,

        onInit : function () {
            var oViewModel;

            this._aTableSearchState = [];

            oViewModel = new JSONModel({
                worklistTableTitle : this.getResourceBundle().getText("worklistTableTitle"),
                tableNoDataText : this.getResourceBundle().getText("tableNoDataText")
            });
            this.setModel(oViewModel, "worklistView");

        },

        onUpdateFinished : function (oEvent) {
            var sTitle,
                oTable = oEvent.getSource(),
                iTotalItems = oEvent.getParameter("total");
            if (iTotalItems && oTable.getBinding("items").isLengthFinal()) {
                sTitle = this.getResourceBundle().getText("worklistTableTitleCount", [iTotalItems]);
            } else {
                sTitle = this.getResourceBundle().getText("worklistTableTitle");
            }
            this.getModel("worklistView").setProperty("/worklistTableTitle", sTitle);
        },

        onPress : function (oEvent) {
            this._showObject(oEvent.getSource());
        },

        onNavBack : function() {
            history.go(-1);
        },

        onSearch: function (oEvent) {
			var aFilter = [];
			var sQuery = oEvent.getParameter("selectionSet")[0].getProperty("value");
			if (sQuery) {
				aFilter.push(new Filter("Fullname", FilterOperator.Contains, sQuery));
			}

			// filter binding
			var oList = this.byId("employeeTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
		},

        onRefresh : function () {
            var oTable = this.byId("employeeTable");
            oTable.getBinding("items").refresh();
        },

        onAddEmployee: function(oEvent) {
            var oList = this.byId("employeeTable")
			var	oBinding = oList.getBinding("items")
            var oRouter = this.getRouter();
			var	oContext = oBinding.create({});
                oContext.created().then(function (oEvent) {
                    oRouter.navTo("object", {
                        objectId: oContext.getPath().substring("/Employees".length)
                    });
                    }, function (oError) {
                });

            oList.getItems().some(function (oItem) {
                if (oItem.getBindingContext() === oContext) {
                    oItem.focus();
                    oItem.setSelected(true);
                    return true;
                }
            });
        },

        _showObject : function (oItem) {
            this.getRouter().navTo("object", {
                objectId: oItem.getBindingContext().getPath().substring("/Employees".length)
            });
        },

        onMasterSkillList : function () {
            this.getRouter().navTo("skills");
        },

        createColumnConfig: function() {
			var aCols = [];

			aCols.push({
				property: 'Fullname',
				type: EdmType.String
			});

			aCols.push({
				property: 'Department',
				type: EdmType.String
			});

            aCols.push({
				property: 'Title',
				type: EdmType.String
			});

            aCols.push({
				property: 'DirectReport',
				type: EdmType.String
			});

			aCols.push({
				property: 'StartDate',
				type: EdmType.Date
			});

			return aCols;
		},

        onExport: function() {
			var aCols, oRowBinding, oSettings, oSheet, oTable;

			if (!this._oTable) {
				this._oTable = this.byId('employeeTable');
			}

			oTable = this._oTable;
			oRowBinding = oTable.getBinding('items');
			aCols = this.createColumnConfig();

			oSettings = {
				workbook: {
					columns: aCols,
					hierarchyLevel: 'Level'
				},
				dataSource: oRowBinding,
				fileName: 'Employee List.xlsx'
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		}
    });
});
