sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/formatter",
    "sap/m/MessageToast",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/export/library",
    "sap/ui/export/Spreadsheet"
], function (BaseController, JSONModel, formatter, MessageToast, Filter, FilterOperator, exportLibrary, Spreadsheet) {
    "use strict";

    var EdmType = exportLibrary.EdmType;

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
			var aFilter = [];
			var sQuerySkill = oEvent.getParameter("selectionSet")[0].getProperty("value");
            var sQueryType = oEvent.getParameter("selectionSet")[1].getProperty("value");
            var sQueryInstitution = oEvent.getParameter("selectionSet")[2].getProperty("value");
			if (sQuerySkill) {
				aFilter.push(new Filter("Skill", FilterOperator.Contains, sQuerySkill));
			} else if (sQueryType) {
                aFilter.push(new Filter("Type", FilterOperator.Contains, sQueryType));
            } else if (sQueryInstitution) {
                aFilter.push(new Filter("Institution", FilterOperator.Contains, sQueryInstitution));
            }

			// filter binding
			var oList = this.byId("skillsTable");
			var oBinding = oList.getBinding("items");
			oBinding.filter(aFilter);
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

        onEmployeeList : function () {
            this.getRouter().navTo("worklist");
        },

        createColumnConfig: function() {
			var aCols = [];

			aCols.push({
				property: 'Skill',
				type: EdmType.String
			});

			aCols.push({
				property: 'Type',
				type: EdmType.String
			});

            aCols.push({
				property: 'Institution',
				type: EdmType.String
			});

			return aCols;
		},

        onExport: function() {
			var aCols, oRowBinding, oSettings, oSheet, oTable;

			if (!this._oTable) {
				this._oTable = this.byId('skillsTable');
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
				fileName: 'Skill List.xlsx'
			};

			oSheet = new Spreadsheet(oSettings);
			oSheet.build().finally(function() {
				oSheet.destroy();
			});
		}
    });
});
