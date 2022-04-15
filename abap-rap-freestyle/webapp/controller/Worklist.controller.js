sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/Spreadsheet"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator, Spreadsheet) {
    "use strict";

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
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("Fullname", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oTable = this.byId("employeeTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters, "Application");
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

        onExportSpreadsheet : function () {
            console.log("exporting");
        }

    });
});
