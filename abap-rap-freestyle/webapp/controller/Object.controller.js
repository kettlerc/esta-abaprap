sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
	"sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter"
], function (BaseController, MessageToast, MessageBox, JSONModel, History, formatter) {
    "use strict";

    var selectedSkill = "";

    return BaseController.extend("freestylerap.abaprapfreestyle.controller.Object", {

        formatter: formatter,

        
        onInit : function () {
            var oViewModel = new JSONModel({
                    editMode: false,
                    busy : true,
                    delay : 0
                });
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "objectView");
            this.oSemanticPage = this.byId("page");
            this.oEditAction = this.byId("editAction");
            this.selectedSkill = "";
        },
       
        onNavBack : function() {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        _onObjectMatched : function (oEvent) {
            var sObjectId =  oEvent.getParameter("arguments").objectId;
            this._bindView("/Employees" + sObjectId);
        },

        _bindView : function (sObjectPath) {
            var oViewModel = this.getModel("objectView");

            this.getView().bindElement({
                path: sObjectPath,
                events: {
                    change: this._onBindingChange.bind(this),
                    dataRequested: function () {
                        oViewModel.setProperty("/busy", true);
                    },
                    dataReceived: function () {
                        oViewModel.setProperty("/busy", false);
                    }
                }
            });
        },

        _onBindingChange : function () {
            var oView = this.getView(),
                oViewModel = this.getModel("objectView"),
                oElementBinding = oView.getElementBinding();

            // No data for the binding
            if (!oElementBinding.getBoundContext()) {
                this.getRouter().getTargets().display("objectNotFound");
                return;
            }
        },

        showFooter : function (bShow) {
			this.oSemanticPage.setShowFooter(bShow);
		},

        onEditEmployee : function () {
            var oViewModel = this.getModel("objectView")
                oViewModel.setProperty("/editMode", true);

            this.byId("bigName").setProperty("visible", false);
            this.byId("bigNameEdit").setProperty("visible", true);
            this.byId("information").setProperty("visible", false);
            this.byId("inputs").setProperty("visible", true);
            this.showFooter(true);
        },

        onSave : function () {
            this.showFooter(false);
            this.oEditAction.setVisible(true);
			var fnSuccess = function () {
			}.bind(this);

			var fnError = function (oError) {
			}.bind(this);

			this.getView().getModel().submitBatch("employeeInfo").then(fnSuccess, fnError);
			this._bTechnicalErrors = false;

            var oViewModel = this.getModel("objectView")
            oViewModel.setProperty("/editMode", false);

            this.byId("bigName").setProperty("visible", true);
            this.byId("bigNameEdit").setProperty("visible", false);
            this.byId("information").setProperty("visible", true);
            this.byId("inputs").setProperty("visible", false);

            MessageToast.show("Changes saved!");
        },

        onResetChanges : function () {
            var oViewModel = this.getModel("objectView")
            oViewModel.setProperty("/editMode", false);
            this.byId("bigName").setProperty("visible", true);
            this.byId("bigNameEdit").setProperty("visible", false);
            this.byId("information").setProperty("visible", true);
            this.byId("inputs").setProperty("visible", false);
            this.showFooter(false);
            this.oEditAction.setVisible(true);
            this.getView().getModel().resetChanges("employeeInfo");
        },

        onOpenDeleteDialog : function () {
			this.byId("deleteDialog").open();
		},

        onDelete : function (oEvent) {
            var oRouter = this.getRouter();
            var employeeContext = this.getView("objectView").byId("page").getBindingContext();
            
            employeeContext.delete("$auto").then(function (oEvent) {
                oRouter.navTo("worklist", {});
                this.byId("deleteDialog").close();
            })

            MessageToast.show("Employee deleted!");
        },

        onCloseDeleteDialog : function () {
			this.byId("deleteDialog").close();
		},

        onDeleteSkill : function () {
            var oSelected = this.byId("skillTable").getSelectedItem();

			if (oSelected) {
				oSelected.getBindingContext().delete("$auto").then(function () {
					MessageToast.show("Skill deleted!");
				}.bind(this), function (oError) {
					MessageBox.error(oError.message);
				});
			}
        },

        onAddSkillDialog : function () {
            this.byId("addSkillDialog").open();
        },

        onCloseAddSkillDialog : function () {
			this.byId("addSkillDialog").close();
		},

        addSkill : function () {
			var List = this.byId("skillTable"),
				Binding = List.getBinding("items"),
				Context = Binding.create({

                        "SkillId": selectedSkill
				});

					List.getItems().some(function (Item) {
				if (Item.getBindingContext() === Context) {
					Item.focus();
					Item.setSelected(true);
					return true;
				}
			});	
			this.getView().getModel().submitBatch("skillGroup");

			this.byId("addSkillDialog").close();
        },

        onSelectChange : function (oEvent) {
            selectedSkill = oEvent.getParameter("selectedItem").getProperty("key");
        }
    });

});
