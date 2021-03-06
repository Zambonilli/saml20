var nameIdentifierClaimType = 'http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier';

var saml20 = module.exports;

saml20.parse = function (assertion) {
	var claims = {};

	if (assertion.AttributeStatement) {
		var attributes = assertion.AttributeStatement.Attribute;

		if (attributes) {
			attributes  = (attributes instanceof Array) ? attributes : [attributes];

			attributes.forEach(function (attribute) {
				claims[attribute['@'].Name] = attribute.AttributeValue;
			});
		}
	}

	if (assertion.Subject.NameID) {
		claims[nameIdentifierClaimType] = assertion.Subject.NameID;
	}

	return {
		claims: claims,
		issuer: assertion.Issuer
	}
};

saml20.validateAudience = function (assertion, realm) {
  return assertion.Conditions.AudienceRestriction.Audience === realm;
};

saml20.validateExpiration = function (assertion) {
 	var notBefore = new Date(assertion.Conditions['@'].NotBefore);
   	notBefore = notBefore.setMinutes(notBefore.getMinutes() - 10);  // 10 minutes clock skew

  	var notOnOrAfter = new Date(assertion.Conditions['@'].NotOnOrAfter);
  	notOnOrAfter = notOnOrAfter.setMinutes(notOnOrAfter.getMinutes() + 10);  // 10 minutes clock skew

  	var now = new Date();
    return !(now < notBefore || now > notOnOrAfter)
 }