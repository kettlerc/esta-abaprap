sap.ui.define([
    "./BaseController",
    "sap/m/MessageToast",
	"sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/routing/History",
    "../model/formatter"
], function (BaseController, MessageToast, MessageBox, JSONModel, History, formatter) {
    "use strict";

    return BaseController.extend("freestylerap.abaprapfreestyle.controller.Object", {

        formatter: formatter,

        /* =========================================================== */
        /* lifecycle methods                                           */
        /* =========================================================== */

        /**
         * Called when the worklist controller is instantiated.
         * @public
         */
        onInit : function () {
            // Model used to manipulate control states. The chosen values make sure,
            // detail page shows busy indication immediately so there is no break in
            // between the busy indication for loading the view's meta data
            var oViewModel = new JSONModel({
                    busy : true,
                    delay : 0
                });
            this.getRouter().getRoute("object").attachPatternMatched(this._onObjectMatched, this);
            this.setModel(oViewModel, "objectView");
            this.oSemanticPage = this.byId("page");
            this.oEditAction = this.byId("editAction");
        },
        /* =========================================================== */
        /* event handlers                                              */
        /* =========================================================== */


        /**
         * Event handler  for navigating back.
         * It there is a history entry we go one step back in the browser history
         * If not, it will replace the current entry of the browser history with the worklist route.
         * @public
         */
        onNavBack : function() {
            var sPreviousHash = History.getInstance().getPreviousHash();
            if (sPreviousHash !== undefined) {
                // eslint-disable-next-line sap-no-history-manipulation
                history.go(-1);
            } else {
                this.getRouter().navTo("worklist", {}, true);
            }
        },

        /* =========================================================== */
        /* internal methods                                            */
        /* =========================================================== */

        /**
         * Binds the view to the object path.
         * @function
         * @param {sap.ui.base.Event} oEvent pattern match event in route 'object'
         * @private
         */
        _onObjectMatched : function (oEvent) {
            var sObjectId =  oEvent.getParameter("arguments").objectId;
            this._bindView("/Employees" + sObjectId);
        },

        /**
         * Binds the view to the object path.
         * @function
         * @param {string} sObjectPath path to the object to be bound
         * @private
         */
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

            var oResourceBundle = this.getResourceBundle(),
                oObject = oView.getBindingContext().getObject(),
                sObjectId = oObject.Id,
                sObjectName = oObject.Employees;

                oViewModel.setProperty("/busy", false);
                oViewModel.setProperty("/shareSendEmailSubject",
                    oResourceBundle.getText("shareSendEmailObjectSubject", [sObjectId]));
                oViewModel.setProperty("/shareSendEmailMessage",
                    oResourceBundle.getText("shareSendEmailObjectMessage", [sObjectName, sObjectId, location.href]));
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
            console.log("Skill added");
        },

        onSelectChange : function (oEvent) {
            var selectedSkill = oEvent.getParameter("selectedItem").getProperty("text");
            var selectedSkillInstitution = oEvent.getParameter("selectedItem").getCustomData();
            console.log(selectedSkill, selectedSkillInstitution);
            this.byId("addSkillDialog").close();
        },
    });

});
