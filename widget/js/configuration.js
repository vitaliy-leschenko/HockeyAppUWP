VSS.init({
	explicitNotifyLoaded: true,
	usePlatformStyles: false
});

VSS.require(["TFS/Dashboards/WidgetHelpers"], function (WidgetHelpers) {
	var $container = $(".container");
	var $fieldset = $container.find("fieldset");
	var $appIdInput = $container.find("#appId");
	var $error = $(".error");

	var isAppIdValid = function () {
		var appId = $appIdInput.val();
		return appId.length > 0;
	};
	
	var parseSettings = function(customSettings){
		if(customSettings && customSettings.hasOwnProperty('data')){
			return customSettings.data;
		} else {
			return customSettings;
		}
	}

	VSS.register("HockeyAppWidget.Configuration", function () {
		var getCustomSettings = function(){
			return {data: JSON.stringify({ appId: $appIdInput.val() })};
		}
		
		return {
			load: function(widgetSettings, widgetConfigurationContext){
				var settings = JSON.parse(parseSettings(widgetSettings.customSettings));
				if (settings && settings.appId) {
					$appIdInput.val(settings.appId);
				}
				
				$appIdInput.on("input", function () {
					if($.isFunction(widgetConfigurationContext.updateLivePreview)){
					widgetConfigurationContext.updateLivePreview();
					}
					else{
						var isValid = isAppIdValid();
						$error.toggle(!isValid);
						if(isValid){
							widgetConfigurationContext.notify(WidgetHelpers.WidgetEvent.ConfigurationChange, WidgetHelpers.WidgetEvent.Args(getCustomSettings()));
						}
					}
				});
				
				return WidgetHelpers.WidgetStatusHelper.Success();
			},
			validate: function(){
				var isValid = isAppIdValid();
				$error.toggle(!isValid);
				if(isValid){
					return WidgetHelpers.WidgetStatusHelper.Success();
				}
				else{
					WidgetHelpers.WidgetStatusHelper.Failure(null);
				}
			},
			getCustomSettings: function(){
				return JSON.stringify({ appId: $appIdInput.val() });
			},
			onSave: function(){
				var isValid = isAppIdValid();
				$error.toggle(!isValid);
				if(isValid){
					return WidgetHelpers.WidgetConfigurationSave.Valid(getCustomSettings());
				}
				else{
					 return WidgetHelpers.WidgetConfigurationSave.Invalid();
				}
			}
		}
	});
	VSS.notifyLoadSucceeded();
});