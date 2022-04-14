sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (BaseController, JSONModel, formatter, Filter, FilterOperator) {
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

        onSearch : function (oEvent) {
            if (oEvent.getParameters().refreshButtonPressed) {
                // Search field's 'refresh' button has been pressed.
                // This is visible if you select any main list item.
                // In this case no new search is triggered, we only
                // refresh the list binding.
                this.onRefresh();
            } else {
                var aTableSearchState = [];
                var sQuery = oEvent.getParameter("query");

                if (sQuery && sQuery.length > 0) {
                    aTableSearchState = [new Filter("Id", FilterOperator.Contains, sQuery)];
                }
                this._applySearch(aTableSearchState);
            }

        },

        _applySearch: function(aTableSearchState) {
            var oTable = this.byId("skillsTable"),
                oViewModel = this.getModel("skillView");
            oTable.getBinding("items").filter(aTableSearchState, "Application");
            // changes the noDataText of the list in case there are no filter results
            if (aTableSearchState.length !== 0) {
                oViewModel.setProperty("/tableNoDataText", this.getResourceBundle().getText("worklistNoDataWithSearchText"));
            }
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

            this.byId("skill").setProperty("visible", false);
            this.byId("skillEdit").setProperty("visible", true);
            this.byId("type").setProperty("visible", false);
            this.byId("typeEdit").setProperty("visible", true);
            this.byId("institution").setProperty("visible", false);
            this.byId("institutionEdit").setProperty("visible", true);
        },

        onSave : function () {
            this.showFooter(false);
            this.oEditAction.setVisible(true);
			var fnSuccess = function () {
			}.bind(this);

			var fnError = function (oError) {
			}.bind(this);

            this.byId("skill").setProperty("visible", true);
            this.byId("skillEdit").setProperty("visible", false);
            this.byId("type").setProperty("visible", true);
            this.byId("typeEdit").setProperty("visible", false);
            this.byId("institution").setProperty("visible", true);
            this.byId("institutionEdit").setProperty("visible", false);
        },

        onResetChanges : function () {
            var oViewModel = this.getModel("skillView")
            oViewModel.setProperty("/editMode", false);
            this.getView().getModel().resetChanges("SkillGroup");

            this.byId("skill").setProperty("visible", true);
            this.byId("skillEdit").setProperty("visible", false);
            this.byId("type").setProperty("visible", true);
            this.byId("typeEdit").setProperty("visible", false);
            this.byId("institution").setProperty("visible", true);
            this.byId("institutionEdit").setProperty("visible", false);
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
        }
    });
});
