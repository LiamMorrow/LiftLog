// <auto-generated/>
#pragma warning disable CS0618
using Microsoft.Kiota.Abstractions.Extensions;
using Microsoft.Kiota.Abstractions.Serialization;
using Microsoft.Kiota.Abstractions;
using RevenueCat.Client.Models;
using RevenueCat.Client.Projects.Item.Offerings.Item;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;
using System.Threading;
using System;
namespace RevenueCat.Client.Projects.Item.Offerings
{
    /// <summary>
    /// Builds and executes requests for operations under \projects\{project_id}\offerings
    /// </summary>
    [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
    public partial class OfferingsRequestBuilder : BaseRequestBuilder
    {
        /// <summary>Gets an item from the RevenueCat.Client.projects.item.offerings.item collection</summary>
        /// <param name="position">ID of the offering</param>
        /// <returns>A <see cref="global::RevenueCat.Client.Projects.Item.Offerings.Item.WithOffering_ItemRequestBuilder"/></returns>
        public global::RevenueCat.Client.Projects.Item.Offerings.Item.WithOffering_ItemRequestBuilder this[string position]
        {
            get
            {
                var urlTplParams = new Dictionary<string, object>(PathParameters);
                urlTplParams.Add("offering_id", position);
                return new global::RevenueCat.Client.Projects.Item.Offerings.Item.WithOffering_ItemRequestBuilder(urlTplParams, RequestAdapter);
            }
        }
        /// <summary>
        /// Instantiates a new <see cref="global::RevenueCat.Client.Projects.Item.Offerings.OfferingsRequestBuilder"/> and sets the default values.
        /// </summary>
        /// <param name="pathParameters">Path parameters for the request</param>
        /// <param name="requestAdapter">The request adapter to use to execute the requests.</param>
        public OfferingsRequestBuilder(Dictionary<string, object> pathParameters, IRequestAdapter requestAdapter) : base(requestAdapter, "{+baseurl}/projects/{project_id}/offerings{?expand*,limit*,starting_after*}", pathParameters)
        {
        }
        /// <summary>
        /// Instantiates a new <see cref="global::RevenueCat.Client.Projects.Item.Offerings.OfferingsRequestBuilder"/> and sets the default values.
        /// </summary>
        /// <param name="rawUrl">The raw URL to use for the request builder.</param>
        /// <param name="requestAdapter">The request adapter to use to execute the requests.</param>
        public OfferingsRequestBuilder(string rawUrl, IRequestAdapter requestAdapter) : base(requestAdapter, "{+baseurl}/projects/{project_id}/offerings{?expand*,limit*,starting_after*}", rawUrl)
        {
        }
        /// <summary>
        /// This endpoint requires the following permission(s): &lt;code&gt;project_configuration:offerings:read&lt;/code&gt;.
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Models.ListOfferings"/></returns>
        /// <param name="cancellationToken">Cancellation token to use when cancelling requests</param>
        /// <param name="requestConfiguration">Configuration for the request such as headers, query parameters, and middleware options.</param>
        /// <exception cref="global::RevenueCat.Client.Models.ListOfferings400Error">When receiving a 400 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListOfferings401Error">When receiving a 401 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListOfferings403Error">When receiving a 403 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListOfferings404Error">When receiving a 404 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListOfferings423Error">When receiving a 423 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListOfferings429Error">When receiving a 429 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListOfferings500Error">When receiving a 500 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.ListOfferings503Error">When receiving a 503 status code</exception>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public async Task<global::RevenueCat.Client.Models.ListOfferings?> GetAsync(Action<RequestConfiguration<global::RevenueCat.Client.Projects.Item.Offerings.OfferingsRequestBuilder.OfferingsRequestBuilderGetQueryParameters>>? requestConfiguration = default, CancellationToken cancellationToken = default)
        {
#nullable restore
#else
        public async Task<global::RevenueCat.Client.Models.ListOfferings> GetAsync(Action<RequestConfiguration<global::RevenueCat.Client.Projects.Item.Offerings.OfferingsRequestBuilder.OfferingsRequestBuilderGetQueryParameters>> requestConfiguration = default, CancellationToken cancellationToken = default)
        {
#endif
            var requestInfo = ToGetRequestInformation(requestConfiguration);
            var errorMapping = new Dictionary<string, ParsableFactory<IParsable>>
            {
                { "400", global::RevenueCat.Client.Models.ListOfferings400Error.CreateFromDiscriminatorValue },
                { "401", global::RevenueCat.Client.Models.ListOfferings401Error.CreateFromDiscriminatorValue },
                { "403", global::RevenueCat.Client.Models.ListOfferings403Error.CreateFromDiscriminatorValue },
                { "404", global::RevenueCat.Client.Models.ListOfferings404Error.CreateFromDiscriminatorValue },
                { "423", global::RevenueCat.Client.Models.ListOfferings423Error.CreateFromDiscriminatorValue },
                { "429", global::RevenueCat.Client.Models.ListOfferings429Error.CreateFromDiscriminatorValue },
                { "500", global::RevenueCat.Client.Models.ListOfferings500Error.CreateFromDiscriminatorValue },
                { "503", global::RevenueCat.Client.Models.ListOfferings503Error.CreateFromDiscriminatorValue },
            };
            return await RequestAdapter.SendAsync<global::RevenueCat.Client.Models.ListOfferings>(requestInfo, global::RevenueCat.Client.Models.ListOfferings.CreateFromDiscriminatorValue, errorMapping, cancellationToken).ConfigureAwait(false);
        }
        /// <summary>
        /// This endpoint requires the following permission(s): &lt;code&gt;project_configuration:offerings:read_write&lt;/code&gt;.
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Models.Offering"/></returns>
        /// <param name="body">The request body</param>
        /// <param name="cancellationToken">Cancellation token to use when cancelling requests</param>
        /// <param name="requestConfiguration">Configuration for the request such as headers, query parameters, and middleware options.</param>
        /// <exception cref="global::RevenueCat.Client.Models.Offering400Error">When receiving a 400 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Offering401Error">When receiving a 401 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Offering403Error">When receiving a 403 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Offering404Error">When receiving a 404 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Offering409Error">When receiving a 409 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Offering422Error">When receiving a 422 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Offering423Error">When receiving a 423 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Offering429Error">When receiving a 429 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Offering500Error">When receiving a 500 status code</exception>
        /// <exception cref="global::RevenueCat.Client.Models.Offering503Error">When receiving a 503 status code</exception>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public async Task<global::RevenueCat.Client.Models.Offering?> PostAsync(global::RevenueCat.Client.Projects.Item.Offerings.OfferingsPostRequestBody body, Action<RequestConfiguration<DefaultQueryParameters>>? requestConfiguration = default, CancellationToken cancellationToken = default)
        {
#nullable restore
#else
        public async Task<global::RevenueCat.Client.Models.Offering> PostAsync(global::RevenueCat.Client.Projects.Item.Offerings.OfferingsPostRequestBody body, Action<RequestConfiguration<DefaultQueryParameters>> requestConfiguration = default, CancellationToken cancellationToken = default)
        {
#endif
            _ = body ?? throw new ArgumentNullException(nameof(body));
            var requestInfo = ToPostRequestInformation(body, requestConfiguration);
            var errorMapping = new Dictionary<string, ParsableFactory<IParsable>>
            {
                { "400", global::RevenueCat.Client.Models.Offering400Error.CreateFromDiscriminatorValue },
                { "401", global::RevenueCat.Client.Models.Offering401Error.CreateFromDiscriminatorValue },
                { "403", global::RevenueCat.Client.Models.Offering403Error.CreateFromDiscriminatorValue },
                { "404", global::RevenueCat.Client.Models.Offering404Error.CreateFromDiscriminatorValue },
                { "409", global::RevenueCat.Client.Models.Offering409Error.CreateFromDiscriminatorValue },
                { "422", global::RevenueCat.Client.Models.Offering422Error.CreateFromDiscriminatorValue },
                { "423", global::RevenueCat.Client.Models.Offering423Error.CreateFromDiscriminatorValue },
                { "429", global::RevenueCat.Client.Models.Offering429Error.CreateFromDiscriminatorValue },
                { "500", global::RevenueCat.Client.Models.Offering500Error.CreateFromDiscriminatorValue },
                { "503", global::RevenueCat.Client.Models.Offering503Error.CreateFromDiscriminatorValue },
            };
            return await RequestAdapter.SendAsync<global::RevenueCat.Client.Models.Offering>(requestInfo, global::RevenueCat.Client.Models.Offering.CreateFromDiscriminatorValue, errorMapping, cancellationToken).ConfigureAwait(false);
        }
        /// <summary>
        /// This endpoint requires the following permission(s): &lt;code&gt;project_configuration:offerings:read&lt;/code&gt;.
        /// </summary>
        /// <returns>A <see cref="RequestInformation"/></returns>
        /// <param name="requestConfiguration">Configuration for the request such as headers, query parameters, and middleware options.</param>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public RequestInformation ToGetRequestInformation(Action<RequestConfiguration<global::RevenueCat.Client.Projects.Item.Offerings.OfferingsRequestBuilder.OfferingsRequestBuilderGetQueryParameters>>? requestConfiguration = default)
        {
#nullable restore
#else
        public RequestInformation ToGetRequestInformation(Action<RequestConfiguration<global::RevenueCat.Client.Projects.Item.Offerings.OfferingsRequestBuilder.OfferingsRequestBuilderGetQueryParameters>> requestConfiguration = default)
        {
#endif
            var requestInfo = new RequestInformation(Method.GET, UrlTemplate, PathParameters);
            requestInfo.Configure(requestConfiguration);
            requestInfo.Headers.TryAdd("Accept", "application/json");
            return requestInfo;
        }
        /// <summary>
        /// This endpoint requires the following permission(s): &lt;code&gt;project_configuration:offerings:read_write&lt;/code&gt;.
        /// </summary>
        /// <returns>A <see cref="RequestInformation"/></returns>
        /// <param name="body">The request body</param>
        /// <param name="requestConfiguration">Configuration for the request such as headers, query parameters, and middleware options.</param>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
        public RequestInformation ToPostRequestInformation(global::RevenueCat.Client.Projects.Item.Offerings.OfferingsPostRequestBody body, Action<RequestConfiguration<DefaultQueryParameters>>? requestConfiguration = default)
        {
#nullable restore
#else
        public RequestInformation ToPostRequestInformation(global::RevenueCat.Client.Projects.Item.Offerings.OfferingsPostRequestBody body, Action<RequestConfiguration<DefaultQueryParameters>> requestConfiguration = default)
        {
#endif
            _ = body ?? throw new ArgumentNullException(nameof(body));
            var requestInfo = new RequestInformation(Method.POST, UrlTemplate, PathParameters);
            requestInfo.Configure(requestConfiguration);
            requestInfo.Headers.TryAdd("Accept", "application/json");
            requestInfo.SetContentFromParsable(RequestAdapter, "application/json", body);
            return requestInfo;
        }
        /// <summary>
        /// Returns a request builder with the provided arbitrary URL. Using this method means any other path or query parameters are ignored.
        /// </summary>
        /// <returns>A <see cref="global::RevenueCat.Client.Projects.Item.Offerings.OfferingsRequestBuilder"/></returns>
        /// <param name="rawUrl">The raw URL to use for the request builder.</param>
        public global::RevenueCat.Client.Projects.Item.Offerings.OfferingsRequestBuilder WithUrl(string rawUrl)
        {
            return new global::RevenueCat.Client.Projects.Item.Offerings.OfferingsRequestBuilder(rawUrl, RequestAdapter);
        }
        /// <summary>
        /// This endpoint requires the following permission(s): &lt;code&gt;project_configuration:offerings:read&lt;/code&gt;.
        /// </summary>
        [global::System.CodeDom.Compiler.GeneratedCode("Kiota", "1.0.0")]
        public partial class OfferingsRequestBuilderGetQueryParameters 
        {
            /// <summary>Specifies which fields in the response should be expanded. Accepted values are: `items.package` (requires `project_configuration:packages:read` permission), `items.package.product` (requires `project_configuration:products:read` permission).</summary>
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
            [QueryParameter("expand")]
            public global::RevenueCat.Client.Projects.Item.Offerings.GetExpandQueryParameterType[]? Expand { get; set; }
#nullable restore
#else
            [QueryParameter("expand")]
            public global::RevenueCat.Client.Projects.Item.Offerings.GetExpandQueryParameterType[] Expand { get; set; }
#endif
            [QueryParameter("limit")]
            public int? Limit { get; set; }
#if NETSTANDARD2_1_OR_GREATER || NETCOREAPP3_1_OR_GREATER
#nullable enable
            [QueryParameter("starting_after")]
            public string? StartingAfter { get; set; }
#nullable restore
#else
            [QueryParameter("starting_after")]
            public string StartingAfter { get; set; }
#endif
        }
    }
}
#pragma warning restore CS0618
