VSS.init({
	explicitNotifyLoaded: true,
	usePlatformStyles: false
    });

 VSS.require(["TFS/Dashboards/WidgetHelpers", "TFS/Dashboards/Services"], function (WidgetHelpers, Dashboard_Services) {
		VSS.register("HockeyAppWidget", function () {     
			var $container = $(".container");
			var $configurationRequiredLink = $(".configuration-required-link");

			var getAppIdFromSettingsString = function (settingsString) {
						var settings = JSON.parse(settingsString);
						return settings.appId;
					};

			// We replace %appid% with the configured value when rendering the links
			var links = [
				{
					text: "Overview",
					url: "https://rink.hockeyapp.net/manage/apps/%appid%",
					cssClass: "link-overview"
				},
				{
					text: "Download",
					url: "https://rink.hockeyapp.net/apps/%appid%",
					cssClass: "link-download"
				},
				{
					text: "Crash reports",
					url: "https://rink.hockeyapp.net/manage/apps/%appid%/crash_reasons/statistics",
					cssClass: "link-crash-reports"
				}
			];
				
			// Indicate to the user that they need to configure the widget
			var showUnconfiguredState = function (showUnconfigured) {
					var $configurationRequiredContainer = $(".configuration-required-container");
					$configurationRequiredContainer.toggle(showUnconfigured);
					$container.toggle(!showUnconfigured);
				};

			var render = function (name, appId) {
					var $title = $container.find(".title");
					var $links = $container.find(".links");
					showUnconfiguredState(false);
					
					$title.text(name);

					$links.empty();
					links.forEach(function (link) {
						var $link = $("<a>")
							.addClass("link")
							.addClass(link.cssClass)
							.attr("href", link.url.replace("%appid%", appId))
							.attr("target", "_blank")
							.text(link.text);

						$links.append($link);
					});
				};
				
			var parseSettings = function(customSettings){
				if(customSettings && customSettings.hasOwnProperty('data')){
					return customSettings.data;
				} else {
					return customSettings;
				}
			}
			
			return {
				load: function (widgetSettings) {			
					$configurationRequiredLink.click(function () { 
						Dashboard_Services.WidgetHostService.getService().then(function (widgetHostService) {
							widgetHostService.showConfiguration();
						});
					});
					
					var settings = parseSettings(widgetSettings.customSettings);
					if (settings) {
						render(widgetSettings.name, getAppIdFromSettingsString(settings));
					} else {
						showUnconfiguredState(true);
					}
					return WidgetHelpers.WidgetStatusHelper.Success();
				},
				reload: function (widgetSettings) {
					var settings = parseSettings(widgetSettings.customSettings);
					render(widgetSettings.name, getAppIdFromSettingsString(parseSettings(settings)));
					return WidgetHelpers.WidgetStatusHelper.Success();
				}
			};
		});
		VSS.notifyLoadSucceeded();
});   