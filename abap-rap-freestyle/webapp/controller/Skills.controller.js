sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, MessageToast, Filter, FilterOperator) {
    "use strict";

    return BaseController.extend("freestylerap.abaprapfreestyle.controller.Skills", {

        formatter: formatter,

        onInit : function () {
            var oViewModel = new JSONModel({
                    editMode: false
                });
			this.getView().setModel(oViewModel, "skillView");
			this.oEditAction = this.byId("editAction");
            this.oSemanticPage = this.byId("skillsPage");
            // keeps the search state
            this._aTableSearchState = [];

        },

        onNavBack : function() {
            // eslint-disable-next-line sap-no-history-manipulation
            history.go(-1);
        },

        onSearch: function (oEvent) {
			var aFilters = [];
			var sQuery = oEvent.getSource().getValue();
			if (sQuery && sQuery.length > 0) {
				var filter = new Filter("Skill", FilterOperator.Contains, sQuery);
				aFilters.push(filter);
			}
			var oTable = this.byId("skillsTable");
			var oBinding = oTable.getBinding("items");
			oBinding.filter(aFilters, "Application");
		},

        showFooter : function (bShow) {
			this.oSemanticPage.setShowFooter(bShow);
		},

        onRefresh : function () {
            var oTable = this.byId("skillsTable");
            oTable.getBinding("items").refresh();
        },

        onAddSkill : function () {
            var oViewModel = this.getView().getModel("skillView");
			oViewModel.setProperty("/editMode", true);
            this.getView().getModel().submitBatch("SkillGroup");
            var oList = this.byId("skillsTable");
            var oBinding = oList.getBinding("items");
            var oContext = oBinding.create({
                "Skill": "",
                "Type": "",
                "Institution": ""
            });

            oList.getItems().some(function (oItem) {
                if (oItem.getBindingContext() === oContext) {
                    oItem.focus();
                    oItem.setSelected(true);
                    return true;
                }
            });
        },

        onEditSkill : function () {
            var oViewModel = this.getView().getModel("skillView");
			oViewModel.setProperty("/editMode", true);
        },

        onSave : function () {
            this.showFooter(false);
            this.oEditAction.setVisible(true);
			var fnSuccess = function () {
			}.bind(this);

			var fnError = function (oError) {
			}.bind(this);

            this.getView().getModel().submitBatch("SkillGroup").then(fnSuccess, fnError);
			this._bTechnicalErrors = false;

            var oViewModel = this.getModel("skillView")
            oViewModel.setProperty("/editMode", false);

            MessageToast.show("Changes saved!");
        },

        onResetChanges : function () {
            var oViewModel = this.getModel("skillView")
            oViewModel.setProperty("/editMode", false);
            this.getView().getModel().resetChanges("SkillGroup");
        },

        onDeleteMasterSkill : function () {
            var oSelected = this.byId("skillsTable").getSelectedItem();

			if (oSelected) {
				oSelected.getBindingContext().delete("$auto").then(function () {
					MessageToast.show("Skill deleted!");
				}.bind(this), function (oError) {
					MessageBox.error(oError.message);
				});
			}
        },

        onExportSpreadsheet : function () {
            console.log("exporting");
        }
    });
});
